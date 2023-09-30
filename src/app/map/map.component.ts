import { Component, OnInit, ElementRef } from "@angular/core";
import {
  Viewer,
  Cesium3DTileset,
  Cartesian2,
  Cartesian3,
  Math,
  HeadingPitchRange,
  RequestScheduler,
  Color,
  LabelStyle,
  VerticalOrigin,
  DistanceDisplayCondition,
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
  viewer: Viewer | undefined;

  constructor(private el: ElementRef) {}

  async ngOnInit(): Promise<void> {
    await this.setupViewer();
    // this.rotateCamera();
    coffeeshops.forEach((e) => this.createMarker(e));
  }

  async setupViewer(): Promise<void> {
    RequestScheduler.requestsByServer = { "tile.googleapis.com:443": 18 };
    this.viewer = new Viewer(this.el.nativeElement, this.viewerOptions);
    const tileset = await Cesium3DTileset.fromUrl(
      `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
    );
    this.viewer.scene.primitives.add(tileset);

    this.viewer.camera.setView({
      destination: Cartesian3.fromDegrees(
        this.coffeeShop.geometry.location.lng,
        this.coffeeShop.geometry.location.lat,
        this.coffeeShop.elevation + this.elevationViewerOffset
      ),
      orientation: {
        heading: 0,
        pitch: -Math.PI / 2,
      },
    });
  }

  rotateCamera(): void {
    //TODO: stop rotating if user taps on scene. start rotating if user idles
    this.pointCameraAt();
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
        pixelOffset: new Cartesian2(0, -40),
        distanceDisplayCondition: new DistanceDisplayCondition(0, 1000),
      },

      billboard: {
        image: shop.logo,
        width: 64,
        height: 64,
      },
    });
  }
}
