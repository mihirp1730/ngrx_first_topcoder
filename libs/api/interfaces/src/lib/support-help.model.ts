export interface HelpSupportOptions {
    callUs?: string;
    myEliteFromPortal?: string;
    myEliteFromNonportal?: string;
    onlineSupport?: string;
    userVoice?: string;
    guruServiceApi?: string;
    guruServicePlatformId: number;
    supportPortalName: string;
    supportPortalApi?: string;
    smaxHelpUrl?: string;
    speakWithSalesUrl?: string;
    ecommerceUrl?: string;
    delfiApp?: boolean;
    activeSubscriptionCheck?: boolean;
    enableSMAX?: boolean;
    enableDelfiREW?: boolean;
    enableDelfiRSMT?: boolean;
    delfiStatus?: string;
    enableCustomerCareCenter?: boolean;
    customerCareCenterUrl?: string;
}

export const ASSET_HELP_WIDGET = {
    PLATFORM_ID: 1053,
    SPPORT_PORTAL_NAME: "Asset Transaction Help"
}