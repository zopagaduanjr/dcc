import { Component, ElementRef } from "@angular/core";
import * as Cesium from "cesium";

@Component({
  selector: "app-navigation-help",
  templateUrl: "./navigation-help.component.html",
  styleUrls: ["./navigation-help.component.css"],
})
export class NavigationHelpComponent {
  constructor(private el: ElementRef) {}
  helpButton: Cesium.NavigationHelpButton = new Cesium.NavigationHelpButton({
    container: this.el.nativeElement,
  });
}
