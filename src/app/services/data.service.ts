import { Injectable } from "@angular/core";
import { Viewer } from "cesium";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor() {}
  viewer: Viewer | undefined;
  toggleInitialCameraInterpol?: Function;
  cancelInitialCameraInterpol?: Function;
  startInitialCameraInterpol = new Subject<boolean>();
}
