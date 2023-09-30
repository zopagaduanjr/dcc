import { Injectable } from "@angular/core";
import { Viewer } from "cesium";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor() {}
  viewer: Viewer | undefined;
}
