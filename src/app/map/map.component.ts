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

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  latitude: number = 7.072156524885305;
  longitude: number = 125.61208610717645;
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
    this.viewer.camera.setView({
      destination: Cartesian3.fromDegrees(this.longitude, this.latitude, 144.0),
      orientation: {
        heading: Math.toRadians(10),
        pitch: Math.toRadians(-10),
      },
    });
  }

  rotateCamera(): void {
    let heading = 0; //or any starting angle in radians
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    let centre = Cartesian3.fromDegrees(this.longitude, this.latitude);
    let elevation = 333; // 100 meters
    let pitch = -0.7854; //looking down at 45 degrees
    const SMOOTHNESS = 600;

    this.viewer?.clock.onTick.addEventListener(() => {
      heading += (rotation * Math.PI) / SMOOTHNESS;
      this.viewer?.camera.lookAt(
        centre,
        new HeadingPitchRange(heading, pitch, elevation)
      );
    });
  }
}
