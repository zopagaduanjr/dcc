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

    var lat = Cesium.Math.toDegrees(0.12348093458854793);
    var lon = Cesium.Math.toDegrees(2.192388248145831);
    var radius = 0.04;
    const property = new Cesium.SampledPositionProperty();
    for (let i = 0; i <= 360; i += 45) {
      const radians = Cesium.Math.toRadians(i);
      const time = Cesium.JulianDate.addSeconds(
        start,
        i,
        new Cesium.JulianDate()
      );
      const position = Cesium.Cartesian3.fromDegrees(
        lon + radius * 1.5 * Math.cos(radians),
        lat + radius * Math.sin(radians),
        Cesium.Math.nextRandomNumber() * 500 + 1750
      );
      property.addSample(time, position);

      //Also create a point for each sample we generate.
      this.viewer?.entities.add({
        position: position,
        point: {
          pixelSize: 8,
          color: Cesium.Color.TRANSPARENT,
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 3,
        },
      });
    }
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
      //Set the entity availability to the same interval as the simulation time.
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),

      //Use our computed positions
      position: position,

      //Automatically compute orientation based on position movement.
      orientation: new Cesium.VelocityOrientationProperty(position),

      //Load the Cesium plane model to represent the entity
      point: {
        pixelSize: 50,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },

      //Show the path as a pink line sampled in 1 second increments.
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.YELLOW,
        }),
        width: 30,
      },
    });
  }
}
