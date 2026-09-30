from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors

OUTPUT = "team_manhattan_nit_hamirpur_A1Launchpad.pdf"

DARK = HexColor("#0f172a")
ACCENT = HexColor("#6366f1")
ACCENT2 = HexColor("#818cf8")
MUTED = HexColor("#64748b")
LIGHT_BG = HexColor("#f8fafc")
BORDER = HexColor("#e2e8f0")
WHITE = HexColor("#ffffff")
GREEN = HexColor("#22c55e")
RED = HexColor("#ef4444")

styles = getSampleStyleSheet()

def style(name, **kwargs):
    return ParagraphStyle(name, **kwargs)

cover_title = style("CoverTitle", fontSize=34, textColor=WHITE, fontName="Helvetica-Bold",
                    spaceAfter=8, alignment=TA_CENTER, leading=40)
cover_sub = style("CoverSub", fontSize=14, textColor=HexColor("#c7d2fe"), fontName="Helvetica",
                  spaceAfter=6, alignment=TA_CENTER, leading=20)
cover_meta = style("CoverMeta", fontSize=11, textColor=HexColor("#94a3b8"), fontName="Helvetica",
                   alignment=TA_CENTER, leading=16)

section_heading = style("SectionH", fontSize=16, textColor=DARK, fontName="Helvetica-Bold",
                        spaceBefore=18, spaceAfter=6, leading=22)
sub_heading = style("SubH", fontSize=12, textColor=ACCENT, fontName="Helvetica-Bold",
                    spaceBefore=10, spaceAfter=4, leading=16)
body = style("Body", fontSize=10, textColor=HexColor("#334155"), fontName="Helvetica",
             spaceAfter=6, leading=16, alignment=TA_JUSTIFY)
body_bold = style("BodyBold", fontSize=10, textColor=DARK, fontName="Helvetica-Bold",
                  spaceAfter=4, leading=15)
caption = style("Caption", fontSize=9, textColor=MUTED, fontName="Helvetica",
                spaceAfter=8, alignment=TA_CENTER, leading=13)
code_style = style("Code", fontSize=9, textColor=HexColor("#1e293b"), fontName="Courier",
                   backColor=LIGHT_BG, spaceAfter=6, leading=14,
                   leftIndent=12, rightIndent=12, spaceBefore=4)
bullet = style("Bullet", fontSize=10, textColor=HexColor("#334155"), fontName="Helvetica",
               spaceAfter=4, leading=15, leftIndent=16, bulletIndent=6)


def P(text, s=None):
    return Paragraph(text, s or body)

def B(text):
    return Paragraph(f"• {text}", bullet)

def HR():
    return HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=10, spaceBefore=4)

def section(title):
    return [
        Spacer(1, 6),
        Paragraph(title, section_heading),
        HRFlowable(width="100%", thickness=2, color=ACCENT, spaceAfter=8, spaceBefore=0),
    ]

def sub(title):
    return Paragraph(title, sub_heading)


def build_cover():
    items = []
    cover_data = [[
        Paragraph("NETRE VMS", cover_title),
    ]]
    cover_table = Table(cover_data, colWidths=[16*cm])
    cover_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("ROWPADDING", (0, 0), (-1, -1), 32),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROUNDEDCORNERS", [12]),
    ]))
    items.append(Spacer(1, 2*cm))
    items.append(cover_table)
    items.append(Spacer(1, 0.6*cm))
    items.append(P("Smart Video Management System", cover_sub))
    items.append(Spacer(1, 0.3*cm))
    items.append(P("A-1 Launchpad 2026 &nbsp;&nbsp;|&nbsp;&nbsp; Case Study Submission", cover_meta))
    items.append(Spacer(1, 0.2*cm))
    items.append(P("Team Manhattan &nbsp;&nbsp;|&nbsp;&nbsp; NIT Hamirpur", cover_meta))
    items.append(Spacer(1, 0.2*cm))
    items.append(P("August 2026", cover_meta))
    items.append(Spacer(1, 1.8*cm))

    pills_data = [["Live CCTV Feeds", "AI Object Detection", "Zone-Based Alerts", "Timeline Playback", "NLP Search"]]
    pills = Table(pills_data, colWidths=[3.1*cm]*5)
    pills.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ACCENT),
        ("TEXTCOLOR", (0, 0), (-1, -1), WHITE),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWPADDING", (0, 0), (-1, -1), 7),
        ("ROUNDEDCORNERS", [6]),
        ("INNERGRID", (0, 0), (-1, -1), 0, WHITE),
        ("BOX", (0, 0), (-1, -1), 0, WHITE),
    ]))
    items.append(pills)
    items.append(PageBreak())
    return items


def build_intro():
    items = section("1. Overview")
    items.append(P(
        "Netre VMS is a full-stack Video Management System built for the A-1 Launchpad 2026 case study. "
        "The system lets users monitor live CCTV camera feeds, review recorded footage, and get AI-powered "
        "detection alerts, all from a single web interface. The idea came from noticing that most surveillance "
        "setups require switching between multiple tools just to do basic things like checking a recording or "
        "finding when someone entered a room. Netre puts everything in one place."
    ))
    items.append(Spacer(1, 4))
    items.append(P(
        "The project covers all five capabilities listed in the case study requirement: live feed monitoring, "
        "timeline-based playback, AI event detection, zone-based filtering, and an event log with NLP search. "
        "It works with IP webcams, RTSP cameras, and recorded video files."
    ))
    return items


def build_architecture():
    items = section("2. System Architecture")
    items.append(P(
        "The system is split into three layers that work independently but communicate through a REST API. "
        "This separation keeps the AI pipeline from blocking the web interface and makes each part easy to "
        "test or swap out."
    ))
    items.append(Spacer(1, 6))

    arch_data = [
        ["Layer", "Technology", "Role"],
        ["Frontend", "React 18 + TypeScript + Vite", "User interface, live tiles, zone drawing, playback"],
        ["Backend API", "FastAPI (Python 3.10)", "REST endpoints, stream routing, DB access, background workers"],
        ["AI Pipeline", "YOLOv8n ONNX + onnxruntime", "Object detection, zone intersection, event writing"],
        ["Database", "SQLite + SQLAlchemy ORM", "Cameras, zones, events, recording metadata"],
        ["Recording", "OpenCV VideoWriter (H.264)", "5-minute MP4 segments written to disk continuously"],
    ]
    arch_table = Table(arch_data, colWidths=[3.2*cm, 5.2*cm, 7.6*cm])
    arch_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), HexColor("#1e293b")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROUNDEDCORNERS", [4]),
    ]))
    items.append(arch_table)
    items.append(Spacer(1, 10))

    items.append(sub("How the pieces connect"))
    items.append(P(
        "The React frontend loads at port 5173 and makes API calls to the FastAPI backend at port 8000. "
        "The backend runs two async background workers from startup. The AI worker reads a frame from each "
        "camera every two seconds, runs it through YOLOv8n, checks whether any detection lands inside a "
        "defined zone, and writes an event to the database if it does. The recording worker runs in parallel "
        "and continuously captures frames into 5-minute H.264 MP4 files saved to disk. Live streams from "
        "HTTP sources like IP Webcam are served via a transparent redirect so the browser connects directly "
        "to the phone, giving near-zero latency."
    ))
    return items


def build_features():
    items = section("3. Features Walkthrough")

    items.append(sub("3.1 Dashboard"))
    items.append(P(
        "The dashboard gives a system-wide snapshot in real time. The four metric cards show active vs total "
        "cameras, events in the last 24 hours, storage used on disk, and active alerts from the last hour. "
        "All numbers are pulled from live database queries with no hardcoded values. Below the metrics is a "
        "camera status grid that shows a green or red dot per camera based on the actual connection status "
        "that the AI worker updates continuously. There is also an AI Search bar where you can type natural "
        "language queries like 'person today' or 'car yesterday morning' and get filtered results."
    ))

    items.append(sub("3.2 Live View"))
    items.append(P(
        "The live view shows all cameras in a responsive grid. Each tile streams live video using MJPEG. "
        "For IP Webcam on Android, the backend issues an HTTP redirect so the browser fetches the stream "
        "directly from the phone, which keeps latency under half a second. Each tile has zoom and rotation "
        "controls, a pulsing alert badge if a detection happened in the last 60 seconds, a fullscreen toggle, "
        "and a shortcut to jump to that camera's playback."
    ))

    items.append(sub("3.3 Zone Editor"))
    items.append(P(
        "This is one of the standout features. Clicking 'Draw Zones' on any camera opens a full-screen "
        "editor with a live video background. There are four drawing tools on the left panel: Polygon for "
        "irregular shapes like doorways, Rectangle for parking spots or counters, Circle for round coverage "
        "areas, and Freeform which works like a pen to draw any shape freely. All zones are saved as "
        "normalized coordinate arrays so they scale correctly across any resolution. Only objects whose "
        "foot position falls inside a defined zone trigger an alert, which cuts false positives significantly."
    ))

    items.append(sub("3.4 AI Detection Pipeline"))
    items.append(P(
        "The detection engine uses YOLOv8n exported to ONNX format and loaded with onnxruntime. It runs "
        "entirely on CPU and takes roughly 30 to 60 milliseconds per frame on a mid-range laptop. The model "
        "detects 80 COCO classes but only person, car, truck, motorcycle, bicycle, dog, cat, and bus are "
        "checked against zones. For each detection, the foot position (bottom-center of the bounding box) "
        "is tested against every zone polygon using OpenCV's pointPolygonTest. If it lands inside, an event "
        "row is written to the database with the camera, zone, label, confidence, and timestamp. Events are "
        "rate-limited to one per 10 seconds per zone to avoid flooding the log."
    ))

    items.append(sub("3.5 Playback and Timeline"))
    items.append(P(
        "The recording worker saves 5-minute MP4 segments for each online camera. The playback view shows "
        "a camera selector, a video player that loads the latest recording automatically, and a timeline "
        "scrubber with red marker pins at the exact positions where AI events occurred. Clicking a marker "
        "seeks the video to the precise second by computing the offset from the recording's start timestamp. "
        "A recording browser below the player lists all saved segments for that camera, and clicking any "
        "one switches the video without a page reload. Playback speed can be set to 0.5x, 1x, 2x, or 4x."
    ))

    items.append(sub("3.6 Events Log"))
    items.append(P(
        "The events page shows a full log of all AI detections in a filterable table. Columns include the "
        "camera name, detected label, confidence as a percentage badge, a description caption, and a "
        "formatted timestamp. Users can filter by camera, by label type, and by date range. Each row has a "
        "play button that navigates directly to the playback view with the video seeked to that event's "
        "exact moment."
    ))
    return items


def build_technical():
    items = section("4. Technical Decisions")

    items.append(sub("Why YOLOv8 nano"))
    items.append(P(
        "YOLOv8n is the smallest variant in the YOLOv8 family at 12 MB. It runs at acceptable speed on a "
        "CPU without needing a GPU, which keeps the setup simple and portable. For a prototype that needs "
        "to run on a laptop during a demo, this was the right trade-off between accuracy and performance. "
        "The ONNX format was chosen because it works across different environments without depending on "
        "PyTorch being installed."
    ))

    items.append(sub("Why SQLite"))
    items.append(P(
        "SQLite removes any setup overhead. There is no database server to configure or manage. The entire "
        "database is a single file which makes the project portable and easy to reset. For a prototype with "
        "up to 10 cameras this is more than sufficient, and the SQLAlchemy ORM means switching to PostgreSQL "
        "later would only require changing the connection string."
    ))

    items.append(sub("Stream routing approach"))
    items.append(P(
        "For HTTP-based cameras like IP Webcam, sending every frame through the Python backend would add "
        "significant delay because OpenCV decodes and re-encodes each frame. Instead the backend returns a "
        "307 redirect, so the browser connects directly to the camera IP. This gives sub-second latency. "
        "For RTSP cameras, the backend proxies the stream as MJPEG since browsers cannot natively read RTSP."
    ))
    return items


def build_setup():
    items = section("5. Setup and Usage")

    items.append(sub("Prerequisites"))
    items.append(B("Python 3.10 and Node.js 18 or higher"))
    items.append(B("IP Webcam app installed on Android phone (or any RTSP/HTTP camera)"))
    items.append(B("Both devices on the same WiFi network"))
    items.append(Spacer(1, 6))

    items.append(sub("Starting the backend"))
    items.append(Paragraph("cd Netre/server<br/>pip install -r requirements.txt<br/>python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload", code_style))

    items.append(sub("Starting the frontend"))
    items.append(Paragraph("cd Netre/app<br/>npm install<br/>npm run dev", code_style))

    items.append(P("Open http://localhost:5173 in a browser. The API runs at http://localhost:8000."))

    items.append(sub("Adding a camera"))
    items.append(P(
        "Click the plus icon in the sidebar to open the Add Device panel. Enter the camera name, source type "
        "(live or file), and the stream URL. For IP Webcam the URL is in the format http://PHONE_IP:8080/video. "
        "The camera will appear in the live view and the AI worker will start processing it within a few seconds."
    ))

    items.append(sub("Setting up detection zones"))
    items.append(P(
        "In the live view, click Draw Zones on any camera. Use the polygon or rectangle tool to mark the area "
        "where detections should trigger. Save the zone. From this point any person or vehicle entering that "
        "region will create an event log entry within 2 to 5 seconds."
    ))
    return items


def build_testing():
    items = section("6. Testing Scenarios")

    test_data = [
        ["Scenario", "What to do", "Expected result"],
        ["Person detection", "Walk through a drawn zone in front of the camera",
         "Event appears in Events log within 5 seconds"],
        ["Outside zone", "Walk in front of camera but outside the zone area",
         "No event is created"],
        ["Camera disconnect", "Kill IP Webcam app on phone",
         "Status dot turns red after 3 failed checks"],
        ["Camera reconnect", "Restart IP Webcam app",
         "Status dot turns green, stream resumes"],
        ["NLP search", "Type 'person today' in AI Search",
         "Only today's person events are returned"],
        ["Playback seek", "Click a red marker on the timeline",
         "Video jumps to exact timestamp of that detection"],
        ["Recording switch", "Click a timestamp in the recordings list",
         "Video player loads that segment without reload"],
        ["Multiple zones", "Draw two zones, walk through each separately",
         "Separate events created for each zone"],
        ["Video file camera", "Add an MP4 file as source_type file",
         "File plays in live view and is detectable"],
    ]
    test_table = Table(test_data, colWidths=[3.8*cm, 5.8*cm, 6.4*cm])
    test_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), HexColor("#1e293b")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWPADDING", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    items.append(test_table)
    return items


def build_problems():
    items = section("7. Problems Faced and How We Fixed Them")

    items.append(sub("High stream latency"))
    items.append(P(
        "Initially every IP Webcam frame was being decoded in Python and re-sent to the browser. This added "
        "about one second of delay on top of the natural network delay. The fix was to check if the stream "
        "URL is HTTP-based and return a redirect response instead of proxying the frames. The browser then "
        "connects directly to the phone, which dropped latency to under 500 milliseconds."
    ))

    items.append(sub("AI module import failure"))
    items.append(P(
        "The original detection pipeline used a custom module that required a specific path setup. When the "
        "FastAPI server started, it could not find the module because the working directory was different. "
        "This caused the AI worker to fail silently with no visible error. The fix was to rewrite the "
        "inference logic to use onnxruntime directly inside the worker, removing the external module dependency "
        "entirely and making the import path predictable."
    ))

    items.append(sub("Recordings not playable in browser"))
    items.append(P(
        "The initial recording codec was mp4v which most browsers do not support natively. After switching "
        "to the avc1 (H.264) codec, new recordings play directly in the browser's video element without any "
        "transcoding or plugin needed."
    ))

    items.append(sub("Fake detection fallback"))
    items.append(P(
        "The AI worker had a fallback that generated a fake person detection whenever the real model failed "
        "to load. This made it look like detection was working in testing but no real inference was happening. "
        "The fallback was removed. If the model is not present the worker logs a warning and detection simply "
        "does not run until the model file is placed in the correct directory."
    ))

    items.append(sub("Timeline seeking was random"))
    items.append(P(
        "The original playback code called Math.random() to seek when a timeline event was clicked, which "
        "obviously jumped to a completely wrong position. Fixed by calculating the actual offset in seconds "
        "as event.occurred_at minus recording.start_time and passing that directly to video.currentTime."
    ))
    return items


def build_future():
    items = section("8. Future Improvements")

    items.append(P(
        "The current system is a working prototype. Several things would make it production-ready:"
    ))
    items.append(B("GPU inference support so detection runs at full frame rate instead of every 2 seconds"))
    items.append(B("Push notifications via Web Push API when a high-confidence detection happens"))
    items.append(B("Multi-camera synchronized playback to review incidents across angles at the same time"))
    items.append(B("Cloud storage integration to back up recordings to S3 or Google Cloud Storage"))
    items.append(B("People counting and heatmaps to show where most activity happens in a zone over time"))
    items.append(B("License plate recognition as an additional model layer for parking and vehicle tracking"))
    items.append(B("Docker deployment so the whole system starts with a single command on any machine"))
    items.append(B("ONVIF protocol support for compatibility with professional IP camera brands"))
    return items


def build_references():
    items = section("9. References and Acknowledgements")
    items.append(P(
        "The motion detection algorithm structure was studied from the Frigate NVR open source project. "
        "The overall system design took inspiration from open-nvr (github.com/open-nvr/open-nvr). "
        "Object detection uses the YOLOv8 model family by Ultralytics, exported to ONNX for inference. "
        "All code in this submission was written by Team Manhattan for this case study."
    ))
    items.append(Spacer(1, 8))
    ref_data = [
        ["Resource", "Link"],
        ["GitHub Repository", "github.com/ashutosh-012/Netre"],
        ["YOLOv8 by Ultralytics", "github.com/ultralytics/ultralytics"],
        ["Open-NVR (Inspiration)", "github.com/open-nvr/open-nvr"],
        ["FastAPI Framework", "fastapi.tiangolo.com"],
        ["onnxruntime", "onnxruntime.ai"],
    ]
    ref_table = Table(ref_data, colWidths=[5*cm, 11*cm])
    ref_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWPADDING", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    items.append(ref_table)
    return items


def on_page(canvas, doc):
    canvas.saveState()
    page_num = doc.page
    if page_num > 1:
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(2*cm, 1.2*cm, "Netre VMS  |  Team Manhattan  |  NIT Hamirpur  |  A-1 Launchpad 2026")
        canvas.drawRightString(19*cm, 1.2*cm, f"Page {page_num}")
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(2*cm, 1.5*cm, 19*cm, 1.5*cm)
    canvas.restoreState()


def build():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )

    story = []
    story += build_cover()
    story += build_intro()
    story += build_architecture()
    story += build_features()
    story += build_technical()
    story += build_setup()
    story += build_testing()
    story += build_problems()
    story += build_future()
    story += build_references()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF created: {OUTPUT}")


if __name__ == "__main__":
    build()
