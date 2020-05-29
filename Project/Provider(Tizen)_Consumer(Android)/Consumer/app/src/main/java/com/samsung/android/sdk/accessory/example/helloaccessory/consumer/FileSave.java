package com.samsung.android.sdk.accessory.example.helloaccessory.consumer;

import android.content.Context;
import android.os.Environment;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class FileSave {
    public static String Save(Context context, String name, String data) {
        File exsaveFile = new File(Environment.getExternalStorageDirectory().getAbsolutePath() + "/auto_save");
        File saveFile = new File(context.getFilesDir() + "/auto_save");
        if(!saveFile.exists()){ // 폴더 없을 경우
            saveFile.mkdir(); // 폴더 생성
        }
        if(!exsaveFile.exists()){ // 폴더 없을 경우
            exsaveFile.mkdir(); // 폴더 생성
        }
        try {
            long now = System.currentTimeMillis(); // 현재시간 받아오기
            Date date = new Date(now); // Date 객체 생성
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String nowTime = sdf.format(date);
            String path;
            BufferedWriter buf;


            path = saveFile+"/auto_save " + name + " " + nowTime + ".txt";
            buf = new BufferedWriter(new FileWriter(path, true));
            buf.append(data); // 파일 쓰기
            buf.newLine(); // 개행
            buf.close();

            path = exsaveFile+"/auto_save " + name + " " + nowTime + ".txt";
            buf = new BufferedWriter(new FileWriter(path, true));
            buf.append(data); // 파일 쓰기
            buf.newLine(); // 개행
            buf.close();



            return path;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "N";

    }
}
