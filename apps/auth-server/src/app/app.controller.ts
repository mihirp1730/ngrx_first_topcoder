import { AppHealthService } from '@apollo/app/health';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceMethod } from '@apollo/tracer';
import { Controller, Get, Headers, HttpException, HttpStatus, Inject, Logger, Post, Query, Req, Res } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { decode } from 'jsonwebtoken';

import { Config, CONFIG_TOKEN } from './modules/config';
import { TrafficManagerJwtTokenValidatorService } from './providers';
import { ProxyService } from './providers/proxy/proxy.service';

/**
 * Contain the 4 old `call-validation-service` endpoints.
 *
 * Summary of endpoints:
 * - `traffic-validate`: Used by backend services to validate the Traffic Manager JWT token sent from frontend requests.
 */
@Controller('api/auth')
export class AppController {
  constructor(
    private _trafficManagerJwtTokenValidator: TrafficManagerJwtTokenValidatorService,
    private readonly appHealthService: AppHealthService,
    private _logger: Logger,
    private _proxy: ProxyService,
    @Inject(CONFIG_TOKEN) private _appConfig: Config
  ) {}

  /**
   * Traffic Manager JWT token verification/validation endpoint.
   *
   * Used by backend services.
   *
   * Checks that the request has headers (or a query string), with valid Traffic Manager JWT token sent
   * from frontend requests.
   *
   * The backed library that does this endpoints requests is from this monorepo, that comes as a NestJS middleware named
   * `RequestValidationMiddleware` from `@gaia/gaia-services-request-validation-middleware`.
   */
  @Post('traffic-validate')
  @GaiaTraceMethod
  async trafficValidate(@Req() req: Request, @Res() res: Response): Promise<void> {
    const token: string = (req.headers['x-traffic-manager'] || req.query.traffic_manager) as string;

    // Check if no TM token.
    if (!token) {
      this._logger.error({ message: 'empty traffic manager token !' });
      throw new HttpException('empty traffic manager token !', HttpStatus.BAD_REQUEST);
    }

    // Validate TM JWT token and send.
    try {
      await this._trafficManagerJwtTokenValidator.validate({ token });
      // If `validate` promise didn't thrown, means that verification passed.
      res.status(200).send({ pass: true });
    } catch (e) {
      // NOTE: No error detail is sent to clients, as current implementation just handle property `pass` as boolean.
      // Ideally we should use an error code if not passed, e.g. 401 Unauthorized, but clients probably won't support
      //  it, as they probably expect a `{pass: false}` instead (as it's right now).
      res.status(200).send({ pass: false });
      // Customize error message to send.
      // throw new HttpException('Error during traffic manager validation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Endpoint for sauth callback, redirect to the correct URL
   */
  @Get('callback')
  @GaiaTraceMethod
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<void> {
    // use code to get sauth token here, need to figure out how to store this sauth token
    this._logger.log('api auth:  callback execution started');
    const [idToken, accessToken, refreshToken] = await this._proxy.getSauthTokenFromCode(code, req.hostname);

    if (!idToken || !accessToken || !refreshToken) {
      res.status(500).send(`Error when getting the token: idToken: ${idToken}, accessToken: ${accessToken}, refreshToken: ${refreshToken}`);
      return;
    }

    this._logger.log('api auth: token received successfully');

    // get redirect URL from state
    const shreddedState = state?.split?.(';');
    if (!shreddedState || shreddedState.length !== 2) {
      this._logger.error('Invalid state received in callback call!');
      res.status(500).send('invalid state');
      return;
    }

    let redirectUrl = shreddedState[1];
    // If the provided redirect url is this callback endpoint,
    // break the loop by removing the path and sending the root.
    if (redirectUrl.endsWith('/api/auth/callback')) {
      redirectUrl = redirectUrl.replace('/api/auth/callback', '');
    }

    // set cookie expire time 2 mins before sauth token expires
    const cookieOptions: CookieOptions = {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(this.getExpireInMilliseconds(accessToken, 2))
    };
    res.cookie('jwt_id', idToken, cookieOptions);
    res.cookie('jwt_access', accessToken, cookieOptions);
    res.cookie('jwt_refresh', refreshToken, cookieOptions);
    res.redirect(redirectUrl);
    this._logger.log('api auth: token returned response, stamped cookies');
  }

  /**
   * Endpoint for logging into sauth (currently with APP id), redirect to sauth link
   * state contains redirect url infomation
   */
  @Get('login')
  @GaiaTraceMethod
  handleLogin(@Req() req: Request, @Query('state') state: string, @Res() res: Response): void {
    const [redirect] = this._proxy.authenticate(state, `https://${req.hostname}`);
    // need to revisit this and read the values from env file
    const allowedOrigins = '*.slb.com, *.slb-ds.com, https://localhost:4200, http://localhost:8080';
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.redirect(redirect);
  }

  /**
   * This endpoint has two functionalities:
   * 1. For guests: return guest access token
   *                or regenerate guest access token when it is about to expire.
   * 2. For users: Get jwt token from request cookie and return it in result's body.
   *               Also refresh token when the token is about to expire.
   */
  @Get('token')
  @GaiaTraceMethod
  async getSauthToken(@Req() req: Request, @Res() res: Response): Promise<void> {
    // if we have refresh token in cookie, then we use user token workflow
    // Or we are on dev environment, we disable guest login
    if (req.cookies['jwt_refresh'] || !this._appConfig.enableGuestLogin) {
      return this.getUserToken(req, res);
    } else {
      // if we do not have refresh token in cookie (or no token in cookie), then we use guest token workflow
      return this.getGuestToken(req, res);
    }
  }

  @GaiaTraceMethod
  async getUserToken(req: Request, res: Response): Promise<void> {
    if (!req.cookies || !req.cookies['jwt_access'] || !req.cookies['jwt_refresh'] || !req.cookies['jwt_id']) {
      res.status(400).send('No allowed cookie in request!');
      return;
    }
    let accessToken = req.cookies['jwt_access'];
    const refreshToken = req.cookies['jwt_refresh'];
    const idToken = req.cookies['jwt_id'] || '';

    // compare the expiration time and current time to determine token should be refreshed or not.
    // if access token is about to expire, we refresh it.
    if (this.getExpireInMilliseconds(accessToken, this._appConfig.timeoutInterval) < Date.now()) {
      this._logger.log('Start refreshing token flow.');
      const [newAccessToken, newRefreshToken, newIdToken] = await this._proxy.refreshToken(refreshToken);
      if (!newAccessToken || !newRefreshToken || !newIdToken) {
        this._logger.error('Error when refreshing the token!');
        res.status(500).send('Error when refreshing the token!');
        return;
      }
      accessToken = newAccessToken;
      const cookieOptions: CookieOptions = {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(this.getExpireInMilliseconds(accessToken, 2))
      };
      res.cookie('jwt_access', newAccessToken, cookieOptions);
      res.cookie('jwt_refresh', newRefreshToken, cookieOptions);
      res.cookie('jwt_id', newIdToken, cookieOptions);
    }
    this._logger.log('api auth: refresh token code executed');
    const [email, hd, firstname, lastname] = await this._proxy.getUserInfo(accessToken);
    this._logger.log(`api auth: getUserInfo received ${email} ${hd} ${firstname} ${lastname}`);
    const [gis_token] = await this._proxy.tokenExchangeService(accessToken);
    let fname = firstname,
      lname = lastname;
    // Adding this code for test user where we are getting fisrtname value in lastname seperated with '-'.
    // i.e. - lastname = 'producer-osdu'
    if (fname === '' && lname.search('-') > 0) {
      fname = lastname.split('-')[0];
      lname = lastname.split('-')[1];
    }
    if (!email || !hd || !fname || !lname) {
      this._logger.error('Error when getting user information!');
      res.status(500).send('Error when getting user information!');
      return;
    }
    res.cookie('gis_token', gis_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(this.getExpireInMilliseconds(gis_token, 2))
    });
    this._logger.log(`api auth: returning status`);
    res.status(200).json({
      access_token: accessToken,
      id_token: idToken,
      name: `${fname} ${lname}`,
      email: email,
      hd: hd,
      gis_token
    });
  }

  @GaiaTraceMethod
  async getGuestToken(req: Request, res: Response): Promise<void> {
    let access_token = JwtTokenMiddleware.getToken(req);
    if (access_token && this.getExpireInMilliseconds(access_token, this._appConfig.timeoutInterval) > Date.now()) {
      const [gisToken] = await this._proxy.tokenExchangeService(access_token);
      res.status(200);
      res.json({ access_token, gisToken });
      return;
    }

    // Retrieve a new guest token...
    access_token = await this._proxy.getGuestToken();
    const [gisToken] = await this._proxy.tokenExchangeService(access_token);
    if (!access_token) {
      this._logger.error('Error when getting the guest token!');
      access_token = null;
      res.status(500);
      res.json({ access_token, gisToken });
      return;
    }

    // Return the guest token and clear out any
    // other "user" cookies.
    const expires = new Date(this.getExpireInMilliseconds(access_token, 2));
    res.clearCookie('jwt_id');
    res.clearCookie('jwt_refresh');
    res.cookie('jwt_access', access_token, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      expires
    });
    res.status(200);
    res.json({ access_token });
  }

  @Get('token-clear')
  @GaiaTraceMethod
  clearTokens(@Res() res: Response): void {
    res.clearCookie('jwt_id');
    res.clearCookie('jwt_access');
    res.clearCookie('jwt_refresh');
    res.json({ error: null });
  }

  @Get('logout')
  @GaiaTraceMethod
  handleLogout(@Query('id_token') id_token: string, @Query('redirect_url') redirect_url: string, @Res() res: Response): void {
    const redirect = this._proxy.getLogoutURL(id_token, redirect_url);
    res.clearCookie('jwt_id');
    res.clearCookie('jwt_access');
    res.clearCookie('jwt_refresh');
    res.redirect(redirect);
  }

  private getExpireInMilliseconds(token: string, expireTimeWindowInMinutes: number) {
    const decodedJwt: any = decode(token);
    const totalExpireTimeInSeconds = Number(decodedJwt.exp);
    const expireTimeWindowInSeconds = expireTimeWindowInMinutes * 60;
    return (totalExpireTimeInSeconds - expireTimeWindowInSeconds) * 1000;
  }

  @Get('health')
  @GaiaTraceMethod
  public getHealthCheck(@Headers('appKey') appKey: string): any {
    return this.appHealthService.healthCheck(appKey);
  }
}
