import { Component } from "@angular/core";
import { DataService } from "../services/data.service";
import { coffeeshops } from "../coffeeshops";
import { CoffeeShop } from "../coffeeshop";
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
  coffeeShops: Array<CoffeeShop> = coffeeshops;
  selectedCoffeeShop?: CoffeeShop;
  selectedCoffeeShopIndex?: number;
  showSetA: boolean = true;
  showSetB: boolean = true;

  flyToCoffeeShop(index: number): void {
    var heading = this.dataService?.viewer?.camera.heading;
    var pitch = this.dataService?.viewer?.camera.pitch;
    var coffeeShopEntity = this.dataService?.entities[index]!;
    if (this.dataService?.overviewSweepRemoveCallback != undefined) {
      this.dataService?.overviewSweepRemoveCallback!();
    }
    this.dataService?.viewer?.flyTo(coffeeShopEntity, {
      offset: new Cesium.HeadingPitchRange(heading, pitch, 0),
    });
    this.selectedCoffeeShop = this.coffeeShops[index];
    this.dataService!.entities[index].show = true;
    this.selectedCoffeeShopIndex = index;
  }

  clearCoffeeShop(): void {
    this.selectedCoffeeShop = undefined;
  }

  setAClick(): void {
    this.showSetA = !this.showSetA;
    for (let index = 0; index < 9; index++) {
      this.dataService!.entities[index].show = this.showSetA;
      this.dataService!.pathA!.show = this.showSetA;
    }
  }
  setBClick(): void {
    this.showSetB = !this.showSetB;
    for (let index = 9; index < 19; index++) {
      this.dataService!.entities[index].show = this.showSetB;
      this.dataService!.pathB!.show = this.showSetB;
    }
  }
}
