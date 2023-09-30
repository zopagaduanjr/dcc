import { Component } from "@angular/core";
import { DataService } from "../services/data.service";

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

  onSelect(): void {
    console.log(
      "AMDG cartographic",
      this.dataService?.viewer?.camera.positionCartographic
    );
    console.log("AMDG positionWC", this.dataService?.viewer?.camera.positionWC);
    console.log(
      "Heading Pitch Roll",
      `(${this.dataService?.viewer?.scene?.camera?.heading},${this.dataService?.viewer?.scene?.camera?.pitch}, ${this.dataService?.viewer?.scene?.camera?.roll})`
    );
  }
}
