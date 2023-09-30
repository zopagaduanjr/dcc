import { Component, OnInit, ElementRef } from "@angular/core";
import {
  Viewer,
  Cesium3DTileset,
  Cartesian2,
  Cartesian3,
  Math,
  HeadingPitchRange,
  HeadingPitchRoll,
  RequestScheduler,
  LabelStyle,
  VerticalOrigin,
  DistanceDisplayCondition,
  Ion,
} from "cesium";
import { environment } from "src/environments/environment";
import { coffeeshops } from "../coffeeshops";
import { CoffeeShop } from "../coffeeshop";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  coffeeShop: CoffeeShop = coffeeshops[0];
  elevationMarkerOffset: number = 74;
  elevationViewerOffset: number = 150;
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
  viewer?: Viewer;
  dataService?: DataService;
  overViewCartesian3: Cartesian3 = new Cartesian3(
    -3687900.922436941,
    5150484.382833073,
    772354.1123908913
  );
  overViewOrientation: HeadingPitchRoll = new HeadingPitchRoll(
    0.20033943352436978,
    -0.3990495255836124,
    0.000009647921471511722
  );

  constructor(private el: ElementRef, _dataService: DataService) {
    this.dataService = _dataService;
  }

  async ngOnInit(): Promise<void> {
    await this.setupViewer();
    this.rotateCamera();
    coffeeshops.forEach((e) => this.createMarker(e));
  }

  async setupViewer(): Promise<void> {
    RequestScheduler.requestsByServer = { "tile.googleapis.com:443": 18 };
    var tileset = null;
    try {
      tileset = await Cesium3DTileset.fromUrl(
        `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
      );
    } catch (e) {
      this.viewerOptions = {
        baseLayerPicker: false,
        homeButton: false,
        geocoder: false,
        sceneModePicker: false,
        timeline: false,
        fullscreenButton: false,
        animation: false,
      };
      Ion.defaultAccessToken = environment.cesiumToken;
      this.elevationMarkerOffset = 0;
    }
    this.viewer = new Viewer(this.el.nativeElement, this.viewerOptions);
    if (tileset != null) {
      this.viewer.scene.primitives.add(tileset);
    }

    this.viewer.camera.setView({
      destination: this.overViewCartesian3,
      orientation: this.overViewOrientation,
    });
    if (this.dataService != null) {
      this.dataService.viewer = this.viewer;
    }
  }

  rotateCamera(): void {
    //TODO: stop rotating if user taps on scene. start rotating if user idles
    // this.pointCameraAt();
    this.viewer?.camera.lookAt(
      this.overViewCartesian3,
      new HeadingPitchRange(0, -0.3990495255836124, 50)
    );
    this.viewer?.clock.onTick.addEventListener(() => {
      this.viewer?.camera.rotate(Cartesian3.UNIT_Z);
    });
  }

  pointCameraAt(): void {
    //TODO: update angle of rotation cause coffeeshops are small
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

  createMarker(shop: CoffeeShop): void {
    //problem i think is that marker gets lost in the terrains, hence can't clamp
    this.viewer?.entities.add({
      name: shop.name,
      position: Cartesian3.fromDegrees(
        shop.geometry.location.lng,
        shop.geometry.location.lat,
        shop.elevation + this.elevationMarkerOffset
      ),

      label: {
        text: shop.name,
        style: LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: VerticalOrigin.BOTTOM,
        pixelOffset: new Cartesian2(0, -80),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 1000),
      },

      billboard: {
        image: shop.logo,
        width: 128,
        height: 64,
        verticalOrigin: VerticalOrigin.BOTTOM,
      },
    });
  }
}
