declare global {
  interface RefTaggerSettings {
    bibleReader: string;
    bibleVersion: string;
    roundCorners: boolean;
    socialSharing: string[];
    tooltipStyle: string;
    customStyle: {
      heading: {
        backgroundColor: string;
        color: string;
      };
      body: {
        color: string;
        fontSize: string;
      };
    };
    nonce?: string;
  }

  interface Window {
    refTagger?: {
      settings: RefTaggerSettings;
    };
  }
}

window.refTagger = {
  settings: {
    bibleReader: "bible.faithlife",
    bibleVersion: "HCSB",
    roundCorners: true,
    socialSharing: ["google"],
    tooltipStyle: "dark",
    customStyle: {
      heading: {
        backgroundColor: "#000000",
        color: "#ebebeb",
      },
      body: {
        color: "#ebebeb",
        fontSize: "16px",
      },
    },
  },
};

((documentRef) => {
  const nonceNode = documentRef.querySelector("[nonce]");
  const nonceValue = nonceNode?.getAttribute("nonce") ?? undefined;
  if (window.refTagger) {
    window.refTagger.settings.nonce = nonceValue;
  }

  const scriptTag = documentRef.createElement("script");
  const firstScriptTag = documentRef.getElementsByTagName("script")[0];

  scriptTag.src = "https://api.reftagger.com/v2/RefTagger.js";
  if (window.refTagger?.settings.nonce) {
    scriptTag.nonce = window.refTagger.settings.nonce;
  }

  if (firstScriptTag?.parentNode) {
    firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
  } else {
    documentRef.head.append(scriptTag);
  }
})(document);

export {};
