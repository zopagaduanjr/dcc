import { Component, OnInit, ElementRef } from "@angular/core";
import * as Cesium from "cesium";
import { environment } from "src/environments/environment";
import { coffeeshops } from "../coffeeshops";
import { setA } from "../coffeeroutes";
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
  currentOnTickStep: number = 0;
  cameraSweepSteps: number = 400;
  forward: boolean = true;
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
    navigationHelpButton: false,
    selectionIndicator: false,
    infoBox: false,
  };
  viewer?: Cesium.Viewer;
  dataService?: DataService;
  overViewCartesian3: Cesium.Cartesian3 = new Cesium.Cartesian3(
    -3684375.1675305003,
    5150018.050607001,
    774385.8930635459
  );
  overViewOrientation: Cesium.HeadingPitchRange = new Cesium.HeadingPitchRange(
    0.2390414619070249,
    -0.31997491023730196,
    50
  );

  constructor(private el: ElementRef, _dataService: DataService) {
    this.dataService = _dataService;
  }

  async ngOnInit(): Promise<void> {
    await this.setupViewer();
    coffeeshops.forEach((e) => this.createMarker(e));
    // this.rotateCamera2();
    this.createPath();
    // setTimeout(() => {
    //   this.rotateCamera2();
    // }, 5000);
  }

  async setupViewer(): Promise<void> {
    Cesium.RequestScheduler.requestsByServer = {
      "tile.googleapis.com:443": 18,
    };
    var tileset = null;
    try {
      // tileset = await Cesium.Cesium3DTileset.fromUrl(
      //   `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
      // );
      throw new Error("dont load maptiles");
    } catch (e) {
      const osm = new Cesium.OpenStreetMapImageryProvider({
        url: "https://tile.openstreetmap.org/",
      });
      this.viewerOptions = {
        baseLayerPicker: false,
        homeButton: false,
        geocoder: false,
        sceneModePicker: false,
        timeline: false,
        fullscreenButton: false,
        animation: false,
        shouldAnimate: true,
        navigationHelpButton: false,
        selectionIndicator: false,
        infoBox: false,
        baseLayer: new Cesium.ImageryLayer(osm, {}),
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
    var entity = this.viewer?.entities.add({
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
    this.dataService?.entities.push(entity!);
  }

  setCircle(): Cesium.SampledPositionProperty {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    var lat = 7.074936402254783;
    var lon = 125.61459367283636;

    var radius = 0.01;
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
        500
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
      this.viewer.clock.multiplier = 10;
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
    var removeCameraFollowerEvent =
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
    this.dataService!.cancelInitialCameraInterpol = removeCameraFollowerEvent;
    this.dataService!.toggleInitialCameraInterpol = (start: boolean) => {
      this.viewer!.clock.shouldAnimate = start;
      if (!start) {
        // this.viewer?.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
    };
  }

  trackEntityFollower(entity: Cesium.Entity): void {
    //use Entity's viewFrom to customize view of trackedEntity
    //create invisible point for trackedEntity to work
    //viewFrom: <any>new Cesium.Cartesian3(3000, -2000, 500),
    // point: {
    //   color: Cesium.Color.TRANSPARENT,
    // },
    this.viewer!.trackedEntity = entity;
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer!.canvas);
    handler.setInputAction((click: any) => {
      if (this.viewer!.trackedEntity != undefined) {
        this.viewer!.trackedEntity = undefined;
        setTimeout(() => {
          entity!.viewFrom = <any>this.viewer!.camera.position;
          this.viewer!.trackedEntity = entity;
        }, 5000);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.viewer?.clock.onTick.addEventListener(() => {
      //TODO: check if trackedEntity is undefined
      // this.viewer?.camera.rotate(Cesium.Cartesian3.UNIT_Z);
    });
  }

  rotateCamera2(): void {
    var heading = this.viewer?.camera.heading;
    var pitch = this.viewer?.camera.pitch;
    var range = this.viewer?.camera.positionCartographic.height;
    this.viewer?.camera.lookAt(
      this.viewer?.camera.position,
      new Cesium.HeadingPitchRange(heading, pitch, range)
    );
    var removeCallBack = this.viewer?.clock.onTick.addEventListener(() => {
      if (this.currentOnTickStep == this.cameraSweepSteps) {
        this.forward = false;
      }
      if (this.currentOnTickStep == 0) {
        this.forward = true;
      }
      if (this.currentOnTickStep < this.cameraSweepSteps && this.forward) {
        this.currentOnTickStep = this.currentOnTickStep + 1;
        this.viewer?.camera.moveRight(30);
        this.viewer?.camera.rotate(Cesium.Cartesian3.UNIT_Z, -0.002);
      } else {
        this.currentOnTickStep = this.currentOnTickStep - 1;
        this.viewer?.camera.moveRight(-30);
        this.viewer?.camera.rotate(Cesium.Cartesian3.UNIT_Z, +0.002);
      }
    });
    var handler = new Cesium.ScreenSpaceEventHandler(this.viewer!.canvas);
    this.dataService!.overviewSweepRemoveCallback = removeCallBack;
    handler.setInputAction((click: any) => {
      removeCallBack!();
      this.viewer?.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }

  setViewerClock2(): void {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      600,
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

  setPath(): Cesium.SampledPositionProperty {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const property = new Cesium.SampledPositionProperty();
    for (let i = 0; i < setA.length; i += 1) {
      const time = Cesium.JulianDate.addSeconds(
        start,
        i,
        new Cesium.JulianDate()
      );
      const position = Cesium.Cartesian3.fromDegrees(
        setA[i][1],
        setA[i][0],
        90
      );
      console.log(setA[i][1], setA[i][0]);
      property.addSample(time, position);
    }
    property.setInterpolationOptions({
      interpolationDegree: 3,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    return property;
  }

  createPath(): void {
    this.setViewerClock2();
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      600,
      new Cesium.JulianDate()
    );
    const position = this.setPath();
    const entity = this.viewer?.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: position,
      orientation: new Cesium.VelocityOrientationProperty(position),
      point: {
        pixelSize: 5,
        color: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: Cesium.Color.YELLOW,
        }),
        width: 10,
      },
    });
  }

  createPath2(): void {
    var polylines = new Cesium.PolylineCollection();
    var zed = setA.map((e) => {
      return e[1], e[0];
    });
    polylines.add({
      positions: Cesium.Cartesian3.fromDegreesArray(zed),
      width: 4,
      material: Cesium.Color.RED,
    });
    var wee = this.viewer?.entities.add({ polyline: polylines });
    this.viewer?.flyTo(wee!);
    // this.viewer?.scene.primitives.add(polylines);
  }

  createPath3(): void {
    this.viewer?.entities.add({});
  }
}
