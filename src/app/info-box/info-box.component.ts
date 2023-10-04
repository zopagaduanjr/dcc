import { Component } from "@angular/core";
import { DataService } from "../services/data.service";
import * as Cesium from "cesium";

@Component({
  selector: "app-info-box",
  templateUrl: "./info-box.component.html",
  styleUrls: ["./info-box.component.css"],
})
export class InfoBoxComponent {
  constructor(_dataService: DataService) {
    this.dataService = _dataService;
  }

  dataService?: DataService;
  position?: string;
  right?: string;
  up?: string;
  direction?: string;

  onSelect(): void {
    this.position =
      "Position" + this.dataService?.viewer?.camera.position.toString();
    this.right =
      "heading" + this.dataService?.viewer?.camera.heading.toString();
    this.up = "pitch" + this.dataService?.viewer?.camera.pitch.toString();
    this.direction =
      "directionWC" + this.dataService?.viewer?.camera.directionWC.toString();
  }

  pauseFlight(): void {
    this.dataService!.toggleInitialCameraInterpol!(false);
    // this.dataService!.cancelInitialCameraInterpol!();
  }
  resumeFlight(): void {
    this.dataService!.toggleInitialCameraInterpol!(true);
    // this.dataService!.startInitialCameraInterpol.next(true);
  }
}
