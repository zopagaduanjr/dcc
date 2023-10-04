import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { InfoBoxComponent } from "./info-box/info-box.component";
import { NavigationHelpComponent } from './navigation-help/navigation-help.component';

@NgModule({
  declarations: [AppComponent, MapComponent, InfoBoxComponent, NavigationHelpComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
