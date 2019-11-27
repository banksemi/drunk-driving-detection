package com.samsung.android.sdk.accessory.example.helloaccessory.consumer;

import android.content.Context;

import java.util.UUID;

public  class UUIDManager {
    public static String GetDevicesUUID(Context mContext){
        String uniqueID = UUID.randomUUID().toString();
        return uniqueID;
    }
}
