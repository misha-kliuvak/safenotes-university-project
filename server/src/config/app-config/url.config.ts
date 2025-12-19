import { registerAs } from '@nestjs/config';

const UrlConfig = registerAs('url', () => {
  const clientUrl = process.env.CLIENT_URL;
  const defaultStaticUrl = process.env.API_URL + '/static';

  const getUrl = (route: string) => clientUrl + route;

  return {
    apiUrl: process.env.API_URL,
    clientUrl: process.env.CLIENT_URL,
    clientDevUrl: process.env.CLIENT_DEV_URL,
    staticFolderUrl: process.env.STATIC_FOLDER_URL || defaultStaticUrl,

    loginUrl: getUrl(process.env.LOGIN_ROUTE),
    signUpUrl: getUrl(process.env.SIGN_UP_ROUTE),
    oauthSignUpCallbackUrl: getUrl(process.env.SIGN_UP_CALLBACK_ROUTE),
    oauthLoginCallbackUrl: getUrl(process.env.LOGIN_CALLBACK_ROUTE),
    dashboardUrl: getUrl(process.env.DASHBOARD_ROUTE),
    authVerifyCompleteUrl: getUrl(process.env.AUTH_VERIFY_COMPLETE_ROUTE),
    previewSafeUrl: getUrl(process.env.PREVIEW_SAFE_ROUTE),
    viewSafeUrl: getUrl(process.env.VIEW_SAFE_ROUTE),
    viewTermSheetUrl: getUrl(process.env.VIEW_TERM_SHEET_ROUTE),
    setNewPasswordUrl: getUrl(process.env.SET_NEW_PASSWORD_ROUTE),
    companyDashboardUrl: getUrl(process.env.COMPANY_DASHBOARD_ROUTE),
  };
});

export type IUrlConfig = Awaited<ReturnType<typeof UrlConfig>>;

export default UrlConfig;
