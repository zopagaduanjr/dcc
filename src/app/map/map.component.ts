import { Component, OnInit, ElementRef } from "@angular/core";
import {
  Viewer,
  Cesium3DTileset,
  Cartesian3,
  Math,
  HeadingPitchRange,
} from "cesium";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  constructor(private el: ElementRef) {}

  async ngOnInit(): Promise<void> {
    let latitude = 7.072156524885305;
    let longitude = 125.61208610717645;
    const viewer = new Viewer(this.el.nativeElement, {
      globe: false,
      baseLayerPicker: false,
      homeButton: false,
      geocoder: false,
      sceneModePicker: false,
      timeline: false,
      fullscreenButton: false,
      animation: false,
      requestRenderMode: true,
    });
    const tileset = await Cesium3DTileset.fromUrl(
      `https://tile.googleapis.com/v1/3dtiles/root.json?key=${environment.googleMap.mapTiles}`
    );
    viewer.scene.primitives.add(tileset);
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(longitude, latitude, 144.0),
      orientation: {
        heading: Math.toRadians(10),
        pitch: Math.toRadians(-10),
      },
    });

    //helicopter
    let heading = 0; //or any starting angle in radians
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    let centre = Cartesian3.fromDegrees(longitude, latitude);
    let elevation = 333; // 100 meters
    let pitch = -0.7854; //looking down at 45 degrees
    const SMOOTHNESS = 600;

    viewer.clock.onTick.addEventListener(() => {
      heading += (rotation * Math.PI) / SMOOTHNESS;
      viewer.camera.lookAt(
        centre,
        new HeadingPitchRange(heading, pitch, elevation)
      );
    });
  }
}
