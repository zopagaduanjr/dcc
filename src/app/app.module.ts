import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { InfoBoxComponent } from "./info-box/info-box.component";

@NgModule({
  declarations: [AppComponent, MapComponent, InfoBoxComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
