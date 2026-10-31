package com.rims.common.util;

import org.springframework.stereotype.Component;

/**
 * High-performance vector Code 128 barcode generator producing SVG output.
 */
@Component
public class BarcodeGenerator {

    // Code 128B patterns (widths of bars and spaces)
    private static final int[][] PATTERNS = {
        {2, 1, 2, 2, 2, 2}, {2, 2, 2, 1, 2, 2}, {2, 2, 2, 2, 2, 1}, {1, 2, 1, 2, 2, 3},
        {1, 2, 1, 3, 2, 2}, {1, 3, 1, 2, 2, 2}, {1, 2, 2, 2, 1, 3}, {1, 2, 2, 3, 1, 2},
        {1, 3, 2, 2, 1, 2}, {2, 2, 1, 2, 1, 3}, {2, 2, 1, 3, 1, 2}, {2, 3, 1, 2, 1, 2},
        {1, 1, 2, 2, 3, 2}, {1, 2, 2, 1, 3, 2}, {1, 2, 2, 2, 3, 1}, {1, 1, 3, 2, 2, 2},
        {1, 2, 3, 1, 2, 2}, {1, 2, 3, 2, 2, 1}, {2, 2, 3, 2, 1, 1}, {2, 2, 1, 1, 3, 2},
        {2, 2, 1, 2, 3, 1}, {2, 1, 3, 2, 1, 2}, {2, 2, 3, 1, 1, 2}, {3, 1, 2, 1, 3, 1},
        {3, 1, 1, 2, 2, 2}, {3, 2, 1, 1, 2, 2}, {3, 2, 1, 2, 2, 1}, {3, 1, 2, 2, 1, 2},
        {3, 2, 2, 1, 1, 2}, {3, 2, 2, 2, 1, 1}, {2, 1, 2, 1, 2, 3}, {2, 1, 2, 3, 2, 1},
        {2, 3, 2, 1, 2, 1}, {1, 1, 1, 3, 2, 3}, {1, 3, 1, 1, 2, 3}, {1, 3, 1, 3, 2, 1},
        {1, 1, 2, 3, 1, 3}, {1, 3, 2, 1, 1, 3}, {1, 3, 2, 3, 1, 1}, {2, 1, 1, 3, 1, 3},
        {2, 3, 1, 1, 1, 3}, {2, 3, 1, 3, 1, 1}, {1, 1, 2, 1, 3, 3}, {1, 1, 2, 3, 3, 1},
        {1, 3, 2, 1, 3, 1}, {1, 1, 3, 1, 2, 3}, {1, 1, 3, 3, 2, 1}, {1, 3, 3, 1, 2, 1},
        {3, 1, 3, 1, 2, 1}, {2, 1, 1, 3, 3, 1}, {2, 3, 1, 1, 3, 1}, {2, 1, 3, 1, 1, 3},
        {2, 1, 3, 3, 1, 1}, {2, 1, 3, 1, 3, 1}, {3, 1, 1, 1, 2, 3}, {3, 1, 1, 3, 2, 1},
        {3, 3, 1, 1, 2, 1}, {3, 1, 2, 1, 1, 3}, {3, 1, 2, 3, 1, 1}, {3, 3, 2, 1, 1, 1},
        {3, 1, 4, 1, 1, 1}, {2, 2, 1, 4, 1, 1}, {4, 3, 1, 1, 1, 1}, {1, 1, 1, 2, 2, 4},
        {1, 1, 1, 4, 2, 2}, {1, 2, 1, 1, 2, 4}, {1, 2, 1, 4, 2, 1}, {1, 4, 1, 1, 2, 2},
        {1, 4, 1, 2, 2, 1}, {1, 1, 2, 2, 1, 4}, {1, 1, 2, 4, 1, 2}, {1, 2, 2, 1, 1, 4},
        {1, 2, 2, 4, 1, 1}, {1, 4, 2, 1, 1, 2}, {1, 4, 2, 2, 1, 1}, {2, 4, 1, 2, 1, 1},
        {2, 2, 1, 1, 1, 4}, {4, 1, 3, 1, 1, 1}, {2, 4, 1, 1, 1, 2}, {1, 3, 4, 1, 1, 1},
        {1, 1, 1, 2, 4, 2}, {1, 2, 1, 1, 4, 2}, {1, 2, 1, 2, 4, 1}, {1, 1, 4, 2, 1, 2},
        {1, 2, 4, 1, 1, 2}, {1, 2, 4, 2, 1, 1}, {4, 1, 1, 2, 1, 2}, {4, 2, 1, 1, 1, 2},
        {4, 2, 1, 2, 1, 1}, {2, 1, 2, 1, 4, 1}, {2, 1, 4, 1, 2, 1}, {4, 1, 2, 1, 2, 1},
        {1, 1, 1, 1, 4, 3}, {1, 1, 1, 3, 4, 1}, {1, 3, 1, 1, 4, 1}, {1, 1, 4, 1, 1, 3},
        {1, 1, 4, 3, 1, 1}, {4, 1, 1, 1, 1, 3}, {4, 1, 1, 3, 1, 1}, {1, 1, 3, 1, 4, 1},
        {1, 1, 4, 1, 3, 1}, {3, 1, 1, 1, 4, 1}, {4, 1, 1, 1, 3, 1}, {2, 1, 1, 4, 1, 2},
        {2, 1, 1, 2, 1, 4}, {2, 1, 1, 2, 3, 2}, {2, 3, 3, 1, 1, 1, 2} // Stop pattern
    };

    private static final int START_B = 104;
    private static final int STOP = 106;

    public String generateCode128Svg(String text) {
        if (text == null || text.trim().isEmpty()) {
            text = "0000000000";
        }
        text = text.trim();

        int checksum = START_B;
        StringBuilder patternSeq = new StringBuilder();

        // Start B
        appendPattern(patternSeq, PATTERNS[START_B]);

        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            int code = c - 32;
            if (code < 0 || code > 105) {
                code = 0;
            }
            checksum += (i + 1) * code;
            appendPattern(patternSeq, PATTERNS[code]);
        }

        int checkCode = checksum % 103;
        appendPattern(patternSeq, PATTERNS[checkCode]);
        appendPattern(patternSeq, PATTERNS[STOP]);

        // Build SVG
        int totalWidth = 0;
        for (int i = 0; i < patternSeq.length(); i++) {
            totalWidth += Character.getNumericValue(patternSeq.charAt(i));
        }

        int quietZone = 20;
        int barHeight = 60;
        int svgWidth = (totalWidth * 2) + (quietZone * 2);
        int svgHeight = barHeight + 35;

        StringBuilder svg = new StringBuilder();
        svg.append(String.format("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"%d\" height=\"%d\" viewBox=\"0 0 %d %d\">",
                svgWidth, svgHeight, svgWidth, svgHeight));
        svg.append(String.format("<rect width=\"%d\" height=\"%d\" fill=\"#ffffff\"/>", svgWidth, svgHeight));

        int currentX = quietZone;
        boolean isBar = true;

        for (int i = 0; i < patternSeq.length(); i++) {
            int width = Character.getNumericValue(patternSeq.charAt(i)) * 2;
            if (isBar) {
                svg.append(String.format("<rect x=\"%d\" y=\"10\" width=\"%d\" height=\"%d\" fill=\"#1e293b\"/>",
                        currentX, width, barHeight));
            }
            currentX += width;
            isBar = !isBar;
        }

        // Text label
        svg.append(String.format("<text x=\"%d\" y=\"%d\" font-family=\"monospace\" font-size=\"14\" text-anchor=\"middle\" fill=\"#334155\">%s</text>",
                svgWidth / 2, barHeight + 25, text));
        svg.append("</svg>");

        return svg.toString();
    }

    private void appendPattern(StringBuilder sb, int[] pattern) {
        for (int w : pattern) {
            sb.append(w);
        }
    }
}
