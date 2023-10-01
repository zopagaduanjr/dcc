import { Component } from "@angular/core";
import { DataService } from "../services/data.service";
import * as Cesium from "cesium";

@Component({
  selector: "app-info-box",
  templateUrl: "./info-box.component.html",
  styleUrls: ["./info-box.component.css"],
})
export class InfoBoxComponent {
  dataService?: DataService;
  constructor(_dataService: DataService) {
    this.dataService = _dataService;
  }

  position?: string;
  right?: string;
  up?: string;
  direction?: string;

  onSelect(): void {
    this.position =
      "Position" + this.dataService?.viewer?.camera.position.toString();
    this.right =
      "RightWC" + this.dataService?.viewer?.camera.rightWC.toString();
    this.up = "upWC" + this.dataService?.viewer?.camera.upWC.toString();
    this.direction =
      "directionWC" + this.dataService?.viewer?.camera.directionWC.toString();
  }
}
