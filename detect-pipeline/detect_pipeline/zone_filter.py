import cv2
import numpy as np

class Zone:
    def __init__(self, name: str, polygon_points: list[tuple[int, int]]):
        self.name = name
        self.polygon = np.array(polygon_points, np.int32)

    def contains(self, box: tuple[int, int, int, int]) -> bool:
        """Check if the bottom-center of the box is inside the polygon."""
        x1, y1, x2, y2 = box
        bottom_center = ((x1 + x2) // 2, y2)
        result = cv2.pointPolygonTest(self.polygon, bottom_center, False)
        return result >= 0
