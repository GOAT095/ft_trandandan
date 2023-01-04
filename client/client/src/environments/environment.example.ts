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
  // example:
  //apiUrl: "http://localhost:4200/api",
  //baseUrl: "https://ft_trandandan.example",
  //apiUrl: "https://ft_trandandan.example/api",
  //oauthUrl: "https://api.intra.42.fr/oauth/authorize?client_id=<client_id>&redirect_uri=<redirect_uri>&response_type=code",
  //githubOAuthUrl: "https://github.com/login/oauth/authorize?client_id=<client_id>",
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
