import * as paper from "paper"
import EventHub from "../Common/Observer";
import {render} from "react-dom";

/**
 * name ToolMove
 * desc 拖拽画布
 */
const ToolMove = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    let view: paper.View = paper.view;
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        view.translate(event.point.subtract(event.downPoint))
    }
}
/**
 * name ToolDrawCircle
 * desc 画圆
 */
const ToolDrawCircle = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        let path: paper.Path.Circle = new paper.Path.Circle({
            center: event.downPoint,
            radius: event.downPoint.subtract(event.point).length,
            strokeColor: "black"
        })
        path.removeOnDrag()
    }
    tool.onMouseDown = (event: paper.ToolEvent) => {
        //页面发生改变之前
        EventHub.emit('pageChangeBefore', null)
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        //页面发生改变之后
        EventHub.emit('pageChangeAfter', null)
    }
}
/**
 * name ToolDrawRect
 * desc 画方
 */
const ToolDrawRect = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        let path: paper.Path.Rectangle = new paper.Path.Rectangle({
            from: event.downPoint,
            to: event.point,
            strokeColor: "black"
        })
        path.removeOnDrag()
    }
    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeBefore', null)
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeAfter', null)
    }
}
/**
 * name ToolFreePen
 * desc 画笔
 */
const ToolFreePen = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    tool.minDistance = 10;

    let path: paper.Path = new paper.Path({
        strokeColor: "black"
    })
    //每当鼠标按下就新建一条路径
    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit("pageChangeBefore", null)
        path = new paper.Path({
            strokeColor: "black"
        })
    }
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        path.add(event.point)
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeAfter', null)
    }
}

/**
 * name ToolDrawSegment
 * desc 画线段
 */
const ToolDrawSegment = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        let path: paper.Path = new paper.Path({
            strokeColor: "black"
        })
        path.add(event.downPoint, event.point);
        path.removeOnDrag()
    }
    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeBefore', null)
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeAfter', null)
    }
}
/**
 * name ToolPointText
 * desc 写字
 */
const ToolPointText = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool()
    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit("pageChangeBefore", null)
        let text: paper.PointText = new paper.PointText({
            point: event.downPoint,
            content: 'wawa',
            fillColor: 'black',
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 25
        });
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeAfter', null)
    }

}
/**
 * name ToolSelectPath
 * desc 选中路径并编辑
 */
const ToolEditPath = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool();
    let project: paper.Project = paper.project;//这个是paper目前活跃的project，可以根据需求改成别的项目
    let selectedShape: any = null;


    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit("pageChangeBefore", null)
        if (!ClickBounds(event, selectedShape)) {
            selectedShape = Ergodic(project.layers[0], event.point)
        }
    }
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        if (selectedShape != null) {
            if (ClickCorner(event, selectedShape)) {
                let x = event.point.subtract(selectedShape.bounds.center)
                let y = selectedShape.bounds.bottomLeft.subtract(selectedShape.bounds.center)
                let factor = x.divide(y).abs()
                selectedShape.scale(factor)
                //缩放
            } else if (ClickBounds(event, selectedShape)) {
                selectedShape.translate(event.delta)
            }
        }
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        EventHub.emit('pageChangeAfter', null)
    }
}
/**
 * name ToolRotate
 * desc 选中并旋转
 */
const ToolRotate = () => {
    RemoveTool()
    let tool: paper.Tool = new paper.Tool();
    let project: paper.Project = paper.project;//这个是paper目前活跃的project，可以根据需求改成别的项目
    let selectedShape: paper.Path = null;
    let rotateFlag: boolean = false;

    tool.onMouseDown = (event: paper.ToolEvent) => {
        EventHub.emit("pageChangeBefore", null)
        if (!ClickBounds(event, selectedShape)) {
            selectedShape = Ergodic(project.layers[0], event.point)
        } else {
            rotateFlag = true;
        }
    }
    tool.onMouseDrag = (event: paper.ToolEvent) => {
        if (selectedShape != null) {
            if (rotateFlag) {
                //旋转(到底怎么确定角度，有待进一步探索)
                selectedShape.rotate(event.delta.angleInRadians, selectedShape.bounds.center)
            }
        }
    }
    tool.onMouseUp = (event: paper.ToolEvent) => {
        rotateFlag = false;
        EventHub.emit('pageChangeAfter', null)
    }
}
/**
 * name ToolEnlarge
 * desc 点击放大
 */
const ToolEnlarge = () => {
    RemoveTool();
    let tool: paper.Tool = new paper.Tool();
    tool.onMouseDown = (event: paper.ToolEvent) => {
        let view: paper.View = paper.view;
        view.scale(1.5, event.point);//1.5是放大比例系数，后面的event.point是放大的中心点
    }
}

//递归遍历layer树
const Ergodic: Function = (nowLayer: paper.Layer, point: paper.Point) => {
    let shape: paper.Path = null;
    let foundIt: boolean = false;
    let layerCache = []
    layerCache.push(nowLayer)
    while (true) {
        //假设layer之间没有循环嵌套
        if (layerCache.length == 0) {
            return shape;
        }
        nowLayer = layerCache.pop()
        nowLayer.children.forEach((item: paper.Path) => {
            if (item.className == 'Layer') {
                layerCache.push(item)
            } else {
                item.bounds.selected = false;
                if (item.closed == false && !foundIt) {
                    if (item.segments.length == 2) {
                        //直线检测算法
                        foundIt = point.subtract(item.segments[0].point).angle.toFixed(0) == item.segments[1].point.subtract(item.segments[0].point).angle.toFixed(0) ? true : false;
                        item.bounds.selected = foundIt;
                        shape = foundIt ? item : null;
                    } else if (item.contains(point) && !foundIt) {
                        //曲线检测
                        item.bounds.selected = !foundIt;//这条语句和foundIt=true先后顺序不能调换
                        shape = item
                        foundIt = true;
                    }
                } else if (item.contains(point) && !foundIt) {//判断是否包含该点（Line的contains得重写）
                    item.bounds.selected = !foundIt;//这条语句和foundIt=true先后顺序不能调换
                    shape = item
                    foundIt = true;
                }
            }
        })
    }
}
//点击边角检测(待改进)
const ClickCorner = (event: paper.ToolEvent, selectedShape: paper.Path) => {
    if (selectedShape != null) {
        let inBottomLeft = event.point.getDistance(selectedShape.bounds.bottomLeft) > 8 ? false : true//这个8得根据图形来调整，太小则随便点都中，太大则不好点中
        let inBottomRight = event.point.getDistance(selectedShape.bounds.bottomRight) > 8 ? false : true
        let inTopLeft = event.point.getDistance(selectedShape.bounds.topLeft) > 8 ? false : true
        let inTopRight = event.point.getDistance(selectedShape.bounds.topRight) > 8 ? false : true
        return inBottomLeft || inBottomRight || inTopLeft || inTopRight;
    }
    return false;
}
//点击边界检测(待改进)
const ClickBounds = (event: paper.ToolEvent, selectedShape: paper.Path) => {
    if (selectedShape != null) {
        let xTest = (event.point.x > selectedShape.bounds.left && event.point.x < selectedShape.bounds.right) ? true : false;
        let yTest = (event.point.y > selectedShape.bounds.top && event.point.y < selectedShape.bounds.bottom) ? true : false;
        return xTest && yTest;
    }
    return false;
}


//清除所有工具的辅助函数，每一个工具函数使用前都要先执行
const RemoveTool = () => {
    //先清除所有的工具
    paper.tools.forEach((item) => {
        item.remove()
    })
}

export {
    ToolMove,
    ToolDrawCircle,
    ToolDrawRect,
    ToolFreePen,
    ToolDrawSegment,
    ToolPointText,
    ToolEditPath,
    ToolRotate,
    ToolEnlarge
}
