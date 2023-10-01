import { Component, OnInit, ElementRef } from "@angular/core";
import * as Cesium from "cesium";
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
  viewerOptions: Cesium.Viewer.ConstructorOptions = {
    globe: false,
    baseLayerPicker: false,
    homeButton: false,
    geocoder: false,
    sceneModePicker: false,
    timeline: false,
    fullscreenButton: false,
    animation: false,
    requestRenderMode: true,
    shouldAnimate: true,
  };
  viewer?: Cesium.Viewer;
  dataService?: DataService;
  overViewCartesian3: Cesium.Cartesian3 = new Cesium.Cartesian3(
    -3687900.922436941,
    5150484.382833073,
    772354.1123908913
  );
  overViewOrientation: Cesium.HeadingPitchRoll = new Cesium.HeadingPitchRoll(
    0.20033943352436978,
    -0.3990495255836124,
    0.000009647921471511722
  );

  constructor(private el: ElementRef, _dataService: DataService) {
    this.dataService = _dataService;
  }

  async ngOnInit(): Promise<void> {
    await this.setupViewer();
    // this.rotateCamera();
    coffeeshops.forEach((e) => this.createMarker(e));
    this.tryInterpol();
  }

  async setupViewer(): Promise<void> {
    Cesium.RequestScheduler.requestsByServer = {
      "tile.googleapis.com:443": 18,
    };
    var tileset = null;
    try {
      // tileset = await Cesium3DTileset.fromUrl(
      //   `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
      // );
      throw new Error("dont load maptiles");
    } catch (e) {
      this.viewerOptions = {
        baseLayerPicker: false,
        homeButton: false,
        geocoder: false,
        sceneModePicker: false,
        timeline: false,
        fullscreenButton: false,
        animation: false,
        shouldAnimate: true,
      };
      Cesium.Ion.defaultAccessToken = environment.cesiumToken;
      this.elevationMarkerOffset = 0;
    }
    this.viewer = new Cesium.Viewer(this.el.nativeElement, this.viewerOptions);
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
      new Cesium.HeadingPitchRange(0, -0.3990495255836124, 50)
    );
    this.viewer?.clock.onTick.addEventListener(() => {
      this.viewer?.camera.rotate(Cesium.Cartesian3.UNIT_Z);
    });
  }

  pointCameraAt(): void {
    //TODO: update angle of rotation cause coffeeshops are small
    const distance =
      Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(
          this.coffeeShop.geometry.viewport.southwest.lng,
          this.coffeeShop.geometry.viewport.southwest.lat,
          this.coffeeShop.elevation
        ),
        Cesium.Cartesian3.fromDegrees(
          this.coffeeShop.geometry.viewport.northeast.lng,
          this.coffeeShop.geometry.viewport.northeast.lat,
          this.coffeeShop.elevation
        )
      ) / 2;
    const target = Cesium.Cartesian3.fromDegrees(
      this.coffeeShop.geometry.location.lng,
      this.coffeeShop.geometry.location.lat,
      this.coffeeShop.elevation
    );
    const pitch = -Math.PI / 4;
    const heading = 0;
    this.viewer?.camera.lookAt(
      target,
      new Cesium.HeadingPitchRange(heading, pitch, distance)
    );
  }

  createMarker(shop: CoffeeShop): void {
    //problem i think is that marker gets lost in the terrains, hence can't clamp
    this.viewer?.entities.add({
      name: shop.name,
      position: Cesium.Cartesian3.fromDegrees(
        shop.geometry.location.lng,
        shop.geometry.location.lat,
        shop.elevation + this.elevationMarkerOffset
      ),

      label: {
        text: shop.name,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -80),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1000),
      },

      billboard: {
        image: shop.logo,
        width: 128,
        height: 64,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
  }

  setCircle(): Cesium.SampledPositionProperty {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    var lat = 7.074936402254783;
    var lon = 125.61459367283636;
    var radius = 0.04;
    const property = new Cesium.SampledPositionProperty();
    for (let i = 0; i <= 360; i += 15) {
      const radians = Cesium.Math.toRadians(i);
      const time = Cesium.JulianDate.addSeconds(
        start,
        i,
        new Cesium.JulianDate()
      );
      const position = Cesium.Cartesian3.fromDegrees(
        lon + radius * Math.cos(radians),
        lat + radius * 1.5 * Math.sin(radians),
        1750
      );
      property.addSample(time, position);
    }
    property.setInterpolationOptions({
      interpolationDegree: 3,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    return property;
  }

  setViewerClock(): void {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      360,
      new Cesium.JulianDate()
    );
    if (this.viewer != null) {
      this.viewer.clock.startTime = start.clone();
      this.viewer.clock.stopTime = stop.clone();
      this.viewer.clock.currentTime = start.clone();
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
      this.viewer.clock.multiplier = 1;
    }
  }

  tryInterpol(): void {
    this.setViewerClock();
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      360,
      new Cesium.JulianDate()
    );
    const position = this.setCircle();
    const entity = this.viewer?.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: position,
      orientation: new Cesium.VelocityOrientationProperty(position),
    });

    this.cameraFollower(entity!);
  }

  cameraFollower(entity: Cesium.Entity): void {
    const camera = this.viewer!.camera;
    camera.position = new Cesium.Cartesian3(0.25, 0.0, 0.0);
    camera.direction = new Cesium.Cartesian3(0, 1, -0.3);
    camera.up = new Cesium.Cartesian3(0.0, 0.0, 1.0);
    camera.right = new Cesium.Cartesian3(0.0, -1.0, 0.0);
    this.viewer!.scene.postUpdate.addEventListener(function (scene, time) {
      const position = entity.position!.getValue(time);
      if (!Cesium.defined(position)) {
        return;
      }

      let transform;
      if (!Cesium.defined(entity.orientation)) {
        transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
      } else {
        const orientation = entity.orientation.getValue(time);
        if (!Cesium.defined(orientation)) {
          return;
        }

        transform = Cesium.Matrix4.fromRotationTranslation(
          Cesium.Matrix3.fromQuaternion(orientation),
          position
        );
      }

      // Save camera state
      const offset = Cesium.Cartesian3.clone(camera.position);
      const direction = Cesium.Cartesian3.clone(camera.direction);
      const up = Cesium.Cartesian3.clone(camera.up);

      // Set camera to be in model's reference frame.
      camera.lookAtTransform(transform);

      // Reset the camera state to the saved state so it appears fixed in the model's frame.
      Cesium.Cartesian3.clone(offset, camera.position);
      Cesium.Cartesian3.clone(direction, camera.direction);
      Cesium.Cartesian3.clone(up, camera.up);
      Cesium.Cartesian3.cross(direction, up, camera.right);
    });
  }
}
