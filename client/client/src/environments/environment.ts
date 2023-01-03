// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/*
Update with: apiUrl, oauthUrl see environment.example.ts
*/

export const environment = {
  /*
  oauthUrl: "<fill with redirect url from intra api dashboard>",
  */
  //apiUrl: "http://localhost:4200/api",
  baseUrl: "https://dev-chat.trt.foobarandlmj.xyz",
  apiUrl: "https://dev-chat.trt.foobarandlmj.xyz/api",
  oauthUrl: "https://api.intra.42.fr/oauth/authorize?client_id=b97a1bd7c20d72ce867716a43253b0fc4ecdc37d0427db54ffed338300208761&redirect_uri=https%3A%2F%2Fdev-chat.trt.foobarandlmj.xyz%2Fapi%2Fauth%2Fredirect&response_type=code",
  githubOAuthUrl: "https://github.com/login/oauth/authorize?client_id=761b6d85a92c80e1666c",
  chatRefreshTime: 1500,
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
