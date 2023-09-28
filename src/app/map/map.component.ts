import { Component, OnInit, ElementRef } from "@angular/core";
import { Viewer } from "cesium";

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const viewer = new Viewer(this.el.nativeElement);
  }
}
