import { Component, OnInit, ElementRef } from "@angular/core";
import * as Cesium from "cesium";
import { environment } from "src/environments/environment";
import { coffeeshops } from "../coffeeshops";
import { setA, setB } from "../coffeeroutes";
import { CoffeeShop } from "../coffeeshop";
import { DataService } from "../services/data.service";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  setAElevation: number = 74;
  setBElevation: number = 74 + 114;
  pathViewerSeconds: number = 600;
  usePhotorealisticTiles: boolean = false;
  elevationMarkerOffset: number = 74; //billboard offset, needed so that entity will not get buried in 3d tiles
  currentOnTickStep: number = 0; //counter for sweeping camera
  cameraSweepTickSteps: number = 400; //maximum sweeping camera tick
  isForward: boolean = true; //flag to forward/reverse camera
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
    this.generateMarkers();
    this.startMovingCamera();
    this.createPath();
    this.createPath(false);
  }

  async setupViewer(): Promise<void> {
    Cesium.RequestScheduler.requestsByServer = {
      "tile.googleapis.com:443": 18,
    };
    var tileset = null;
    try {
      if (this.usePhotorealisticTiles) {
        tileset = await Cesium.Cesium3DTileset.fromUrl(
          `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
        );
      } else {
        throw new Error("dont load maptiles");
      }
    } catch (e) {
      //google maps photorealistic quota exhausted
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

  generateMarkers() {
    coffeeshops.forEach((e) => this.createMarker(e));
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

  startMovingCamera(): void {
    var heading = this.viewer?.camera.heading;
    var pitch = this.viewer?.camera.pitch;
    var range = this.viewer?.camera.positionCartographic.height;
    this.viewer?.camera.lookAt(
      this.viewer?.camera.position,
      new Cesium.HeadingPitchRange(heading, pitch, range)
    );
    var removeCallBack = this.viewer?.clock.onTick.addEventListener(() => {
      if (this.currentOnTickStep == this.cameraSweepTickSteps) {
        this.isForward = false;
      }
      if (this.currentOnTickStep == 0) {
        this.isForward = true;
      }
      if (
        this.currentOnTickStep < this.cameraSweepTickSteps &&
        this.isForward
      ) {
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

  setViewerClock(): void {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      this.pathViewerSeconds,
      new Cesium.JulianDate()
    );
    if (this.viewer != null) {
      this.viewer.clock.startTime = start.clone();
      this.viewer.clock.stopTime = stop.clone();
      this.viewer.clock.currentTime = start.clone();
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
      this.viewer.clock.multiplier = 5;
    }
  }

  generatePolylinePaths(
    isSetA: boolean = true
  ): Cesium.SampledPositionProperty {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const property = new Cesium.SampledPositionProperty();
    var polylines = isSetA ? setA : setB;
    var elevation = isSetA ? this.setAElevation : this.setBElevation;
    for (let i = 0; i < polylines.length; i += 1) {
      const time = Cesium.JulianDate.addSeconds(
        start,
        i,
        new Cesium.JulianDate()
      );
      const position = Cesium.Cartesian3.fromDegrees(
        polylines[i][1],
        polylines[i][0],
        elevation
      );
      property.addSample(time, position);
    }
    property.setInterpolationOptions({
      interpolationDegree: 3,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    //TODO: make property const so that it won't calculate every time
    return property;
  }

  createPath(isSetA: boolean = true): void {
    this.setViewerClock();
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      this.pathViewerSeconds,
      new Cesium.JulianDate()
    );
    const position = this.generatePolylinePaths(isSetA);
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
        color: isSetA ? Cesium.Color.YELLOW : Cesium.Color.RED,
        outlineColor: isSetA ? Cesium.Color.YELLOW : Cesium.Color.RED,
        outlineWidth: 2,
      },
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: isSetA ? Cesium.Color.YELLOW : Cesium.Color.RED,
        }),
        width: 10,
      },
    });
  }
}
