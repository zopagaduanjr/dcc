import { Component, OnInit, ElementRef } from "@angular/core";
import {
  Viewer,
  Cesium3DTileset,
  Cartesian3,
  Math,
  HeadingPitchRange,
  RequestScheduler,
} from "cesium";
import { environment } from "src/environments/environment";
import { coffeeshops } from "../coffeeshops";
import { CoffeeShop } from "../coffeeshop";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  coffeeShop: CoffeeShop = coffeeshops[1];
  viewerOptions: Viewer.ConstructorOptions = {
    globe: false,
    baseLayerPicker: false,
    homeButton: false,
    geocoder: false,
    sceneModePicker: false,
    timeline: false,
    fullscreenButton: false,
    animation: false,
    requestRenderMode: true,
  };
  viewer: Viewer | undefined;

  constructor(private el: ElementRef) {}

  async ngOnInit(): Promise<void> {
    await this.setupViewer();
    this.rotateCamera();
  }

  async setupViewer(): Promise<void> {
    RequestScheduler.requestsByServer = { "tile.googleapis.com:443": 18 };
    this.viewer = new Viewer(this.el.nativeElement, this.viewerOptions);
    const tileset = await Cesium3DTileset.fromUrl(
      `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
    );
    this.viewer.scene.primitives.add(tileset);
    // this.viewer.camera.setView({
    //   destination: Cartesian3.fromDegrees(
    //     this.coffeeShop.geometry.location.lng,
    //     this.coffeeShop.geometry.location.lat,
    //     this.coffeeShop.elevation
    //   ),
    //   orientation: {
    //     heading: Math.toRadians(10),
    //     pitch: Math.toRadians(-10),
    //   },
    // });
  }

  rotateCamera(): void {
    this.pointCameraAt();
    this.viewer?.clock.onTick.addEventListener(() => {
      this.viewer?.camera.rotate(Cartesian3.UNIT_Z);
    });
  }

  pointCameraAt(): void {
    const distance =
      Cartesian3.distance(
        Cartesian3.fromDegrees(
          this.coffeeShop.geometry.viewport.southwest.lng,
          this.coffeeShop.geometry.viewport.southwest.lat,
          this.coffeeShop.elevation
        ),
        Cartesian3.fromDegrees(
          this.coffeeShop.geometry.viewport.northeast.lng,
          this.coffeeShop.geometry.viewport.northeast.lat,
          this.coffeeShop.elevation
        )
      ) / 2;
    const target = Cartesian3.fromDegrees(
      this.coffeeShop.geometry.location.lng,
      this.coffeeShop.geometry.location.lat,
      this.coffeeShop.elevation
    );
    const pitch = -Math.PI / 4;
    const heading = 0;
    this.viewer?.camera.lookAt(
      target,
      new HeadingPitchRange(heading, pitch, distance)
    );
  }
}
