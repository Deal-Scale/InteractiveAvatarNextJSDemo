import "@/styles/globals.css";

import { Metadata } from "next";
import Script from "next/script";
import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

import AudioDebugShim from "@/components/AudioDebugShim";
import { ToastProvider } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ThemeBridge from "@/components/ThemeBridge";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "HeyGen Interactive Avatar SDK Demo",
    template: `%s - HeyGen Interactive Avatar SDK Demo`,
  },
  icons: {
    icon: "/heygen-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className="min-h-screen bg-background text-foreground">
        <Script id="audio-debug-early" strategy="beforeInteractive">{`
          (function(){
            try {
              var md = navigator.mediaDevices;
              if (md && !md.__AUDIO_PATCHED) {
                var orig = md.getUserMedia && md.getUserMedia.bind(md);
                if (typeof orig === 'function') {
                  md.getUserMedia = async function(constraints){
                    try { console.info('[AudioDebugEarly] getUserMedia called with:', constraints); } catch(_e){}
                    var patched = constraints;
                    try {
                      if (constraints && constraints.audio && typeof constraints.audio === 'object') {
                        var audio = Object.assign({}, constraints.audio);
                        var hadSR = Object.prototype.hasOwnProperty.call(audio,'sampleRate');
                        var hadCC = Object.prototype.hasOwnProperty.call(audio,'channelCount');
                        delete audio.sampleRate; delete audio.channelCount;
                        if (audio.echoCancellation !== false) audio.echoCancellation = false;
                        if (audio.noiseSuppression !== false) audio.noiseSuppression = false;
                        if (audio.autoGainControl !== false) audio.autoGainControl = false;
                        patched = Object.assign({}, constraints, { audio });
                        console.info('[AudioDebugEarly] patched constraints', { strippedSampleRate: hadSR, strippedChannelCount: hadCC, patched });
                      }
                    } catch(_e){}
                    var stream = await orig(patched);
                    try {
                      var tracks = stream.getAudioTracks();
                      tracks.forEach(function(t,i){
                        var s = (t.getSettings && t.getSettings()) || {};
                        console.info('[AudioDebugEarly] track#'+i+' settings', s);
                      });
                    } catch(_e){}
                    return stream;
                  }
                }
                md.__AUDIO_PATCHED = true;
              }

              var AC = window.AudioContext; var WkAC = window.webkitAudioContext;
              function wrapCtor(ACtor,label){
                if(!ACtor || ACtor.__WRAPPED) return ACtor;
                var Wrapped = new Proxy(ACtor, { construct: function(target,args){
                  // Do NOT force or modify sampleRate. Only create and log.
                  var ctx = new target(...(args || []));
                  try { console.info('[AudioDebugEarly] '+label+' created',{ sampleRate: ctx.sampleRate, state: ctx.state }); } catch(_e){}
                  return ctx;
                }});
                Wrapped.__WRAPPED = true; return Wrapped;
              }
              if (AC) window.AudioContext = wrapCtor(AC,'AudioContext');
              if (WkAC) window.webkitAudioContext = wrapCtor(WkAC,'webkitAudioContext');

              var OrigCreate = window.AudioContext && window.AudioContext.prototype && window.AudioContext.prototype.createMediaStreamSource;
              if (OrigCreate && !OrigCreate.__WRAPPED) {
                window.AudioContext.prototype.createMediaStreamSource = function(stream){
                  try {
                    var sr = this.sampleRate;
                    var tracks = (stream.getAudioTracks && stream.getAudioTracks()) || [];
                    var settings = (tracks[0] && tracks[0].getSettings && tracks[0].getSettings()) || {};
                    console.info('[AudioDebugEarly] createMediaStreamSource: context SR=', sr, 'track settings=', settings);
                  } catch(_e){}
                  return OrigCreate.call(this, stream);
                }
                window.AudioContext.prototype.createMediaStreamSource.__WRAPPED = true;
              }
            } catch(_e){}
          })();
        `}</Script>
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <ToastProvider>
            <main className="relative flex flex-col h-screen w-screen">
              <ThemeBridge />
              <AudioDebugShim />

              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
