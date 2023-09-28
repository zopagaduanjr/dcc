import { Component, OnInit, ElementRef } from "@angular/core";
import { Viewer, Cesium3DTileset, Cartesian3, Math } from "cesium";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  constructor(private el: ElementRef) {}

  async ngOnInit(): Promise<void> {
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
      destination: Cartesian3.fromDegrees(
        125.61208610717645,
        7.072156524885305,
        144.0
      ),
      orientation: {
        heading: Math.toRadians(10),
        pitch: Math.toRadians(-10),
      },
    });
  }
}
