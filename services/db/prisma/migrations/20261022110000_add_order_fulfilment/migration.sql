CREATE TYPE "FulfilmentStatus" AS ENUM (
    'NOT_STARTED',
    'PROCESSING',
    'PACKED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'DELIVERED',
    'ON_HOLD',
    'DELIVERY_FAILED'
);

CREATE TABLE "OrderFulfilment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "FulfilmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "deliveryProvider" TEXT,
    "trackingReference" TEXT,
    "operationalNotes" TEXT,
    "startedAt" TIMESTAMP(3),
    "packedAt" TIMESTAMP(3),
    "readyForDispatchAt" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderFulfilment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderFulfilmentHistory" (
    "id" TEXT NOT NULL,
    "fulfilmentId" TEXT NOT NULL,
    "previousStatus" "FulfilmentStatus",
    "newStatus" "FulfilmentStatus" NOT NULL,
    "actorUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderFulfilmentHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderFulfilment_orderId_key"
ON "OrderFulfilment"("orderId");

CREATE INDEX "OrderFulfilment_status_idx"
ON "OrderFulfilment"("status");

CREATE INDEX "OrderFulfilmentHistory_fulfilmentId_createdAt_idx"
ON "OrderFulfilmentHistory"("fulfilmentId", "createdAt");

CREATE INDEX "OrderFulfilmentHistory_actorUserId_idx"
ON "OrderFulfilmentHistory"("actorUserId");

ALTER TABLE "OrderFulfilment"
ADD CONSTRAINT "OrderFulfilment_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderFulfilmentHistory"
ADD CONSTRAINT "OrderFulfilmentHistory_fulfilmentId_fkey"
FOREIGN KEY ("fulfilmentId") REFERENCES "OrderFulfilment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
