import { Injectable } from "@angular/core";
import * as Cesium from "cesium";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor() {}
  viewer: Cesium.Viewer | undefined;
  entities: Array<Cesium.Entity> = [];
  pathA?: Cesium.Entity;
  pathB?: Cesium.Entity;
  overviewSweepRemoveCallback?: Cesium.Event.RemoveCallback;
}
