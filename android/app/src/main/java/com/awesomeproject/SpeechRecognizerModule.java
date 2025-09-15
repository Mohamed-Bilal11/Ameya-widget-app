package com.awesomeproject;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;

public class SpeechRecognizerModule extends ReactContextBaseJavaModule implements RecognitionListener{

    private SpeechRecognizer speechRecognizer = null;
    private ReactApplicationContext reactContext;
    private boolean isListening = false;

    public SpeechRecognizerModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }
    
    @NonNull
    @Override
    public String getName() {
        return "SpeechRecognizerModule";
    }

    @ReactMethod
    public void startListening() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                if (speechRecognizer == null) {
                    speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext);
                    speechRecognizer.setRecognitionListener(SpeechRecognizerModule.this);
                }
                isListening = true;
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                speechRecognizer.startListening(intent);
            }
        });
    }

    @ReactMethod
    public void stopListening() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                isListening = false;
                if (speechRecognizer != null) {
                    speechRecognizer.stopListening();
                }
            }
        });
    }

    @ReactMethod
    public void destroyRecognizer() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                isListening = false;
                if (speechRecognizer != null) {
                    speechRecognizer.destroy();
                    speechRecognizer = null;
                }
            }
        });
    }

    @Override
    public void onResults(Bundle results){
     ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
     if(matches != null && !matches.isEmpty()){
         sendEvent("onSpeechResults",matches.get(0));
     }
     
     // Restart listening immediately for continuous mode
     if (isListening) {
         new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
             @Override
             public void run() {
                 if (isListening && speechRecognizer != null) {
                     Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                     intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                     intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                     intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                     speechRecognizer.startListening(intent);
                 }
             }
         }, 50); // Very short delay to restart immediately
     }
    }

   @Override
   public void onPartialResults(Bundle results){
    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    if(matches != null && !matches.isEmpty()){
        sendEvent("onSpeechResults",matches.get(0));
    }
   }

   private void sendEvent(String eventName,String params){
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName,params);
   }

   @Override 
   public void onReadyForSpeech(Bundle params){}
   
   @Override 
   public void onBeginningOfSpeech(){}
   
   @Override 
   public void onRmsChanged(float rmsdB){}
   
   @Override 
   public void onEndOfSpeech(){
       // Don't stop listening automatically - let user control it
   }
   
   @Override 
   public void onError(int error){
       if (isListening) {
           new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
               @Override
               public void run() {
                   if (isListening && speechRecognizer != null) {
                       Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                       intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                       intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
                       intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                       speechRecognizer.startListening(intent);
                   }
               }
           }, 100);
       }
   }
   
   @Override 
   public void onEvent(int eventType,Bundle params){}
   
   @Override 
   public void onBufferReceived(byte[] buffer){}

}
