package com.rims.rfid;

import java.util.List;

/**
 * Modular hardware adapter interface for RFID portal and handheld readers.
 * Enables transparent swapping between physical hardware drivers and simulation mode.
 */
public interface RfidAdapter {

    boolean isHardwareConnected();

    String getReaderModel();

    List<RfidTagResult> readTags(String antennaId, int readDurationMs);

    record RfidTagResult(String epcTag, int rssi, long timestamp) {}
}
