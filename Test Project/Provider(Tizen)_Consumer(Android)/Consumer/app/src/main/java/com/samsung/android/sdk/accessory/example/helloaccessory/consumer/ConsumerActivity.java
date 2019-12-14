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

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class ConsumerActivity extends Activity {
    private static TextView mTextView;
    private static MessageAdapter mMessageAdapter;
    private boolean mIsBound = false;
    private ListView mMessageListView;
    private ConsumerService mConsumerService = null;
    private Handler mHandler = new Handler();

    public void ToastMessage(final String text)
    {
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                try {
                    Toast.makeText(ConsumerActivity.this, text, Toast.LENGTH_SHORT).show();
                } catch (Exception e)
                {
                    Log.e("에러",e.getMessage());
                }
            }
        });
    }
    public int relax_heartrate = 0;
    public int sending_delay = 0;
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

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                FileSave.Save(getApplicationContext(),"Health", CSVFormating());
            }
        },1000,60000);

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                // 자동 연결
                if (mIsBound == true && mConsumerService != null) {
                    mConsumerService.findPeers();
                }
            }
        },1000,60000);

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                int now = 0;
                int count = 0;
                for(int i = ConsumerService.SensorData.size() - 1; i >= 0 && i >= ConsumerService.SensorData.size() - 300; i++) {
                    try {
                        int rate = ConsumerService.SensorData.get(i).getInt("heartRate");
                        if (rate > 10) {
                            now += rate;
                            count++;
                        }
                    } catch (Exception e) {}
                }
                if (count != 0)
                    now /= count;

                if (relax_heartrate > now) relax_heartrate = now;

                int need_delay = 5 - (relax_heartrate - now) / 10;
                if (need_delay < 0) need_delay = 0;

                if (sending_delay < need_delay) {
                    ServerUpload("Health", CSVFormating());
                    sending_delay = 0;
                } else {
                    sending_delay++;
                }
            }
        },60000 * 10,60000 * 10);




        WebView webView = (WebView) findViewById(R.id.main_web);
        WebSettings webSettings = webView.getSettings();
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAppCacheEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setPluginState(WebSettings.PluginState.ON);
        webView.loadUrl("https://gp.easylab.kr/?uuid=" + UUIDManager.GetDevicesUUID(this));
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
                ServerUpload("Health", CSVFormating());
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
                    ToastMessage("서버 업로드 준비");
                    String boundary = "*****";
                    String lineEnd = "\r\n";
                    String twoHyphens = "--";
                    String filename = "file.txt";
                    URL urlToRequest = new URL("https://gp-api.easylab.kr/Test.php?" + "type=" + type + "&application_name=기본_프로필&uuid=" + UUIDManager.GetDevicesUUID(getApplicationContext()));
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
                    ToastMessage("결과" + response.toString());
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
    private String CSVFormating() {
        ToastMessage("CSV 포맷 변환중");
        final StringBuilder sb = new StringBuilder("timestamp, heartRate, gyroscopeX, gyroscopeY, gyroscopeZ, gyroscopeRotationX, gyroscopeRotationY, gyroscopeRotationZ, light\n");
        // JSONObject json:ConsumerService.SensorData

        for (int i = 0; i < ConsumerService.SensorData.size(); i++) {
            try {
                JSONObject json = ConsumerService.SensorData.get(i);
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
        return sb.toString();
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
