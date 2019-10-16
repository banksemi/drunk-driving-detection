/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved. 
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that 
 * the following conditions are met:
 * 
 *     * Redistributions of source code must retain the above copyright notice, 
 *       this list of conditions and the following disclaimer. 
 *     * Redistributions in binary form must reproduce the above copyright notice, 
 *       this list of conditions and the following disclaimer in the documentation and/or 
 *       other materials provided with the distribution. 
 *     * Neither the name of Samsung Electronics Co., Ltd. nor the names of its contributors may be used to endorse or 
 *       promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package com.samsung.android.sdk.accessory.example.helloaccessory.consumer;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import com.estimote.sdk.Beacon;
import com.estimote.sdk.BeaconManager;
import com.estimote.sdk.Region;
import com.estimote.sdk.SystemRequirementsChecker;

public class ConsumerActivity extends Activity {
    private static TextView mTextView;
    private static MessageAdapter mMessageAdapter;
    private boolean mIsBound = false;
    private ListView mMessageListView;
    private ConsumerService mConsumerService = null;
    private BeaconManager beaconManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mTextView = (TextView) findViewById(R.id.tvStatus);
        mMessageListView = (ListView) findViewById(R.id.lvMessage);
        mMessageAdapter = new MessageAdapter();
        mMessageListView.setAdapter(mMessageAdapter);
        // Bind service
        mIsBound = bindService(new Intent(ConsumerActivity.this, ConsumerService.class), mConnection, Context.BIND_AUTO_CREATE);


        beaconManager = new BeaconManager(getApplicationContext());
        // Application 설치가 끝나면 Beacon Monitoring Service를 시작한다.
        // Application을 종료하더라도 Service가 계속 실행된다.
        beaconManager.connect(new BeaconManager.ServiceReadyCallback() {
            @Override
            public void onServiceReady() {
                Log.d("비콘", "시작");
                beaconManager.startMonitoring(new Region(
                                                "monitored region",
                                                UUID.fromString("e686fdd0-c6f1-4a49-8048-4fe964dc2400"), 0, 0));
            }
        });



        beaconManager.setRangingListener(new BeaconManager.RangingListener() {
            @Override
            public void onBeaconsDiscovered(Region region, List<Beacon> list) {
                if (!list.isEmpty()) {
                    for (Beacon b: list) {

                        Log.d("비콘", "신호" + b.getRssi());
                    }
                }
            }
        });
        // Android 단말이 Beacon 의 송신 범위에 들어가거나, 나왔을 때를 체크한다.
        beaconManager.setMonitoringListener(new BeaconManager.MonitoringListener() {
            @Override
            public void onEnteredRegion(Region region, List<Beacon> list) {
                Log.d("비콘", "연결" + list.get(0).getRssi());
            }
            @Override
            public void onExitedRegion(Region region) {
                Log.d("비콘", "나감");
            }
        });
    }

    @Override
    protected void onDestroy() {
        // Clean up connections
        if (mIsBound == true && mConsumerService != null) {
            if (mConsumerService.closeConnection() == false) {
                updateTextView("Disconnected");
                mMessageAdapter.clear();
            }
        }
        // Un-bind service
        if (mIsBound) {
            unbindService(mConnection);
            mIsBound = false;
        }
        super.onDestroy();
    }

    public void mOnClick(View v) {
        switch (v.getId()) {
            case R.id.buttonConnect: {
                if (mIsBound == true && mConsumerService != null) {
                    mConsumerService.findPeers();
                }
                break;
            }
            case R.id.buttonDisconnect: {
                if (mIsBound == true && mConsumerService != null) {
                    if (mConsumerService.closeConnection() == false) {
                        updateTextView("Disconnected");
                        Toast.makeText(getApplicationContext(), R.string.ConnectionAlreadyDisconnected, Toast.LENGTH_LONG).show();
                        mMessageAdapter.clear();
                    }
                }
                break;
            }
            case R.id.buttonSend: {
                if (mIsBound == true && mConsumerService != null) {
                    if (mConsumerService.sendData("Hello Accessory!")) {
                    } else {
                        Toast.makeText(getApplicationContext(), R.string.ConnectionAlreadyDisconnected, Toast.LENGTH_LONG).show();
                    }
                }
                break;
            }
            case R.id.buttonSave:
                Save();
                break;
            default:
        }
    }

    private void ServerUpload(final String type, final String data)
    {
        new Thread() {
            @Override
            public void run() {
                super.run();
                try {
                    String boundary = "*****";
                    String lineEnd = "\r\n";
                    String twoHyphens = "--";
                    String filename = "file.txt";
                    URL urlToRequest = new URL("https://api.easyrobot.co.kr/Test.php?" + "type=" + type);
                    HttpURLConnection urlConnection =
                            (HttpURLConnection) urlToRequest.openConnection();
                    urlConnection.setDoOutput(true);
                    urlConnection.setDoInput(true);
                    urlConnection.setRequestMethod("POST");
                    urlConnection.setRequestProperty("Connection", "Keep-Alive");
                    urlConnection.setRequestProperty("ENCTYPE", "multipart/form-data");
                    urlConnection.setRequestProperty("Content-Type", "multipart/form-data;boundary=" + boundary);
                    urlConnection.setRequestProperty("uploaded_file", filename);

                    DataOutputStream dos = new DataOutputStream(urlConnection.getOutputStream());
                    dos.writeBytes(twoHyphens + boundary + lineEnd);
                    dos.writeBytes("Content-Disposition: form-data; name=\"uploaded_file\";filename=\""
                            + filename + "\"" + lineEnd);

                    dos.writeBytes(lineEnd);
                    dos.writeBytes(data);
                    dos.writeBytes(lineEnd);
                    dos.writeBytes(twoHyphens + boundary + twoHyphens + lineEnd);

                    int serverResponseCode = urlConnection.getResponseCode();
                    String serverResponseMessage = urlConnection.getResponseMessage();


                    BufferedReader in = new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));

                    String inputLine;
                    StringBuffer response = new StringBuffer();
                    while ((inputLine = in.readLine()) != null) { response.append(inputLine); }

                    Log.d("결과", response.toString());
                    in.close();
                    dos.flush();
                    dos.close();

                }
                catch (Exception e)
                {
                    Log.e("에러", e.getMessage());
                    //.makeText(getApplicationContext(), "에러" + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            }
        }.start();
    }
    private void Save()
    {
        final StringBuilder sb = new StringBuilder("timestamp, heartRate, gyroscopeX, gyroscopeY, gyroscopeZ, gyroscopeRotationX, gyroscopeRotationY, gyroscopeRotationZ, light\n");
        for (JSONObject json:ConsumerService.SensorData) {
            try {
                sb.append(json.get("timestamp") + ",");
                sb.append(json.get("heartRate") + ",");
                JSONObject motion = (JSONObject) json.get("motion");
                JSONObject gyroscope = (JSONObject) motion.get("gyroscope");
                JSONObject gyroscopeRotation = (JSONObject) motion.get("gyroscopeRotation");
                sb.append(gyroscope.get("x") + ",");
                sb.append(gyroscope.get("y") + ",");
                sb.append(gyroscope.get("z") + ",");
                sb.append(gyroscopeRotation.get("x") + ",");
                sb.append(gyroscopeRotation.get("y") + ",");
                sb.append(gyroscopeRotation.get("z") + ",");
                sb.append(json.get("light") + "\n");
            } catch (Exception e) {
                Toast.makeText(getApplicationContext(), e.getMessage(), Toast.LENGTH_LONG).show();
            }
        }
        ServerUpload("Health", sb.toString());
    }
    private final ServiceConnection mConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            mConsumerService = ((ConsumerService.LocalBinder) service).getService();
            updateTextView("onServiceConnected");
        }

        @Override
        public void onServiceDisconnected(ComponentName className) {
            mConsumerService = null;
            mIsBound = false;
            updateTextView("onServiceDisconnected");
        }
    };

    public static void addMessage(String data) {
        mMessageAdapter.addMessage(new Message(ConsumerService.SensorData.size() + "개 수신\n" + data));
    }

    public static void updateTextView(final String str) {
        mTextView.setText(str);
    }

    private class MessageAdapter extends BaseAdapter {
        private static final int MAX_MESSAGES_TO_DISPLAY = 20;
        private List<Message> mMessages;

        public MessageAdapter() {
            mMessages = Collections.synchronizedList(new ArrayList<Message>());
        }

        void addMessage(final Message msg) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (mMessages.size() == MAX_MESSAGES_TO_DISPLAY) {
                        mMessages.remove(0);
                        mMessages.add(msg);
                    } else {
                        mMessages.add(msg);
                    }
                    notifyDataSetChanged();
                    mMessageListView.setSelection(getCount() - 1);
                }
            });
        }

        void clear() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mMessages.clear();
                    notifyDataSetChanged();
                }
            });
        }

        @Override
        public int getCount() {
            return mMessages.size();
        }

        @Override
        public Object getItem(int position) {
            return mMessages.get(position);
        }

        @Override
        public long getItemId(int position) {
            return 0;
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            LayoutInflater inflator = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View messageRecordView = null;
            if (inflator != null) {
                messageRecordView = inflator.inflate(R.layout.message, null);
                TextView tvData = (TextView) messageRecordView.findViewById(R.id.tvData);
                Message message = (Message) getItem(position);
                tvData.setText(message.data);
            }
            return messageRecordView;
        }
    }

    private static final class Message {
        String data;

        public Message(String data) {
            super();
            this.data = data;
        }
    }
}
