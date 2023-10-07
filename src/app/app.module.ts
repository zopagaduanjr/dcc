import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { InfoBoxComponent } from "./info-box/info-box.component";
import { NavigationHelpComponent } from "./navigation-help/navigation-help.component";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/elevation/elevation.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/divider/divider.js";
import "@material/web/icon/icon.js";
import "@material/web/checkbox/checkbox.js";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    InfoBoxComponent,
    NavigationHelpComponent,
  ],
  imports: [BrowserModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
