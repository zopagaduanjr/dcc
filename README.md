# Dcc

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## Adding Cesium with Angular

Since angular is using a module bundler webpack, adding Cesium requires a little bit more of configuration.

install cesium `npm i cesium`

install a custom webpack `npm i @angular-builders/custom-webpack@15.0.0`

in file `angular.json`, update builders to use custom webpack. Reference `extra-webpack.config.js` file into `customWebpackConfig`. Lastly reference cesium assets and styles.

supply `CESIUM_BASE_URL` with the asset directory in `main.ts` file

you should now have the cesium rendering

## Adding Google Maps Elevation API

Elevation service is a server-side API.

## Coffeeshop Data

Comes from dcc-data repository.

## Angular Material

Angular material seems to have clashing issue with cesium css & `@angular-builders/custom-webpack`

## Coffee Shop Data

Coffee shop data comes from repository [dcc-data](https://github.com/zopagaduanjr/dcc-data) which contains API helpers on retrieving location related data.
