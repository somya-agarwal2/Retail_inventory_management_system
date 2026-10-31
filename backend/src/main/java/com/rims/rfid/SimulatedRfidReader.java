package com.rims.rfid;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class SimulatedRfidReader implements RfidAdapter {

    private final Random random = new Random();

    @Override
    public boolean isHardwareConnected() {
        // Honest hardware representation: simulated reader mode
        return false;
    }

    @Override
    public String getReaderModel() {
        return "Simulated EPC Gen2 UHF Dock Door Portal (Impinj Speedway R420 Emulator)";
    }

    @Override
    public List<RfidTagResult> readTags(String antennaId, int readDurationMs) {
        List<RfidTagResult> results = new ArrayList<>();
        // Generate simulated tag reads
        int count = 3 + random.nextInt(4);
        for (int i = 0; i < count; i++) {
            String hexTag = "E2801170" + String.format("%08X", random.nextInt(Integer.MAX_VALUE));
            int rssi = -45 - random.nextInt(35);
            results.add(new RfidTagResult(hexTag, rssi, System.currentTimeMillis()));
        }
        return results;
    }
}
