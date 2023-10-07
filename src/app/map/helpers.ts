import * as Cesium from "cesium";
import { CoffeeShop } from "../coffeeshop";
import { DataService } from "../services/data.service";

export class Helpers {
  rotateCamera(viewer: Cesium.Viewer, target: Cesium.Cartesian3): void {
    //TODO: stop rotating if user taps on scene. start rotating if user idles
    // this.pointCameraAt();
    viewer.camera.lookAt(
      target,
      new Cesium.HeadingPitchRange(0, -0.3990495255836124, 50)
    );
    viewer.clock.onTick.addEventListener(() => {
      viewer.camera.rotate(Cesium.Cartesian3.UNIT_Z);
    });
  }

  pointCameraAt(viewer: Cesium.Viewer, coffeeShop: CoffeeShop): void {
    //TODO: update angle of rotation cause coffeeshops are small
    const distance =
      Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(
          coffeeShop.geometry.viewport.southwest.lng,
          coffeeShop.geometry.viewport.southwest.lat,
          coffeeShop.elevation
        ),
        Cesium.Cartesian3.fromDegrees(
          coffeeShop.geometry.viewport.northeast.lng,
          coffeeShop.geometry.viewport.northeast.lat,
          coffeeShop.elevation
        )
      ) / 2;
    const target = Cesium.Cartesian3.fromDegrees(
      coffeeShop.geometry.location.lng,
      coffeeShop.geometry.location.lat,
      coffeeShop.elevation
    );
    const pitch = -Math.PI / 4;
    const heading = 0;
    viewer.camera.lookAt(
      target,
      new Cesium.HeadingPitchRange(heading, pitch, distance)
    );
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

  setViewerClock(viewer: Cesium.Viewer): void {
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      360,
      new Cesium.JulianDate()
    );
    viewer.clock.startTime = start.clone();
    viewer.clock.stopTime = stop.clone();
    viewer.clock.currentTime = start.clone();
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
    viewer.clock.multiplier = 10;
  }

  tryInterpol(viewer: Cesium.Viewer, dataService: DataService): void {
    this.setViewerClock(viewer);
    const start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
    const stop = Cesium.JulianDate.addSeconds(
      start,
      360,
      new Cesium.JulianDate()
    );
    const position = this.setCircle();
    const entity = viewer.entities.add({
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: start,
          stop: stop,
        }),
      ]),
      position: position,
      orientation: new Cesium.VelocityOrientationProperty(position),
    });
    this.cameraFollower(viewer, entity, dataService);
  }
  cameraFollower(
    viewer: Cesium.Viewer,
    entity: Cesium.Entity,
    dataService: DataService
  ): void {
    const camera = viewer.camera;
    camera.position = new Cesium.Cartesian3(0.25, 0.0, 0.0);
    camera.direction = new Cesium.Cartesian3(0, 1, -0.3);
    camera.up = new Cesium.Cartesian3(0.0, 0.0, 1.0);
    camera.right = new Cesium.Cartesian3(0.0, -1.0, 0.0);
    var removeCameraFollowerEvent = viewer.scene.postUpdate.addEventListener(
      function (scene, time) {
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
      }
    );
    dataService.cancelInitialCameraInterpol = removeCameraFollowerEvent;
    dataService.toggleInitialCameraInterpol = (start: boolean) => {
      viewer.clock.shouldAnimate = start;
      if (!start) {
        // this.viewer?.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
    };
  }

  trackEntityFollower(viewer: Cesium.Viewer, entity: Cesium.Entity): void {
    //use Entity's viewFrom to customize view of trackedEntity
    //create invisible point for trackedEntity to work
    //viewFrom: <any>new Cesium.Cartesian3(3000, -2000, 500),
    // point: {
    //   color: Cesium.Color.TRANSPARENT,
    // },
    viewer.trackedEntity = entity;
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    handler.setInputAction((click: any) => {
      if (viewer.trackedEntity != undefined) {
        viewer.trackedEntity = undefined;
        setTimeout(() => {
          entity!.viewFrom = <any>viewer.camera.position;
          viewer.trackedEntity = entity;
        }, 5000);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    viewer.clock.onTick.addEventListener(() => {
      //TODO: check if trackedEntity is undefined
      // this.viewer?.camera.rotate(Cesium.Cartesian3.UNIT_Z);
    });
  }
}
