package com.rims.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AnalyticsDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummaryDto {
        private long totalProducts;
        private long totalWarehouses;
        private long totalStores;
        private long totalInventoryUnits;
        private BigDecimal totalInventoryValue;
        private long lowStockProducts;
        private long outOfStockProducts;
        private long pendingOrders;
        private long completedOrders;
        private long totalSuppliers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartsDataDto {
        private List<CategoryShare> stockByCategory;
        private List<WarehouseValuation> valueByWarehouse;
        private List<MonthlyMovement> monthlyMovements;
        private List<OrderStatusBreakdown> orderStatuses;
        private List<TopProduct> topSellingProducts;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class CategoryShare {
            private String category;
            private long units;
            private BigDecimal value;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class WarehouseValuation {
            private String warehouse;
            private long units;
            private BigDecimal valuation;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class MonthlyMovement {
            private String month;
            private long stockIn;
            private long stockOut;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class OrderStatusBreakdown {
            private String status;
            private long count;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class TopProduct {
            private String sku;
            private String name;
            private long totalSold;
            private BigDecimal revenue;
        }
    }
}
