import util from "./helpers";
import SignalProtocolStore from "./InMemorySignalProtocolStore";

const libsignal = window.libsignal;

export class SignalServerStore {
  registerNewPreKeyBundle(userId, preKeyBundle) {
    let storageBundle = { ...preKeyBundle };
    storageBundle.identityKey = util.arrayBufferToBase64(
      storageBundle.identityKey
    );
    storageBundle.preKeys = storageBundle.preKeys.map((preKey) => {
      return {
        ...preKey,
        publicKey: util.arrayBufferToBase64(preKey.publicKey),
      };
    });
    storageBundle.signedPreKey.publicKey = util.arrayBufferToBase64(
      storageBundle.signedPreKey.publicKey
    );
    storageBundle.signedPreKey.signature = util.arrayBufferToBase64(
      storageBundle.signedPreKey.signature
    );
    localStorage.setItem(userId, JSON.stringify(storageBundle));
  }

  updatePreKeyBundle(userId, preKeyBundle) {
    localStorage.setItem(userId, JSON.stringify(preKeyBundle));
  }

  getPreKeyBundle(userId) {
    let preKeyBundle = JSON.parse(localStorage.getItem(userId));
    let preKey = preKeyBundle.preKeys.splice(-1);
    preKey[0].publicKey = util.base64ToArrayBuffer(preKey[0].publicKey);
    this.updatePreKeyBundle(userId, preKeyBundle);
    return {
      identityKey: util.base64ToArrayBuffer(preKeyBundle.identityKey),
      registrationId: preKeyBundle.registrationId,
      signedPreKey: {
        keyId: preKeyBundle.signedPreKey.keyId,
        publicKey: util.base64ToArrayBuffer(
          preKeyBundle.signedPreKey.publicKey
        ),
        signature: util.base64ToArrayBuffer(
          preKeyBundle.signedPreKey.signature
        ),
      },
      preKey: preKey[0],
    };
  }
}

class SignalProtocolManager {
  constructor(userId, signalServerStore) {
    this.userId = userId;
    this.store = new SignalProtocolStore();
    this.signalServerStore = signalServerStore;
  }

  async initializeAsync() {
    await this._generateIdentityAsync();

    var preKeyBundle = await this._generatePreKeyBundleAsync();

    this.signalServerStore.registerNewPreKeyBundle(this.userId, preKeyBundle);
  }

  async encryptMessageAsync(recipientUserId, message) {
    var sessionCipher = this.store.loadSessionCipher(recipientUserId);

    if (sessionCipher == null) {
      var address = new libsignal.SignalProtocolAddress(recipientUserId, 123);
      var sessionBuilder = new libsignal.SessionBuilder(this.store, address);

      var remoteUserPreKey =
        this.signalServerStore.getPreKeyBundle(recipientUserId);
      await sessionBuilder.processPreKey(remoteUserPreKey);

      sessionCipher = new libsignal.SessionCipher(this.store, address);
      this.store.storeSessionCipher(recipientUserId, sessionCipher);
    }

    let cipherText = await sessionCipher.encrypt(util.toArrayBuffer(message));
    return cipherText;
  }

  async decryptMessageAsync(senderUserId, cipherText) {
    var sessionCipher = this.store.loadSessionCipher(senderUserId);

    if (sessionCipher == null) {
      var address = new libsignal.SignalProtocolAddress(senderUserId, 123);
      sessionCipher = new libsignal.SessionCipher(this.store, address);
      this.store.storeSessionCipher(senderUserId, sessionCipher);
    }

    var messageHasEmbeddedPreKeyBundle = cipherText.type === 3;

    if (messageHasEmbeddedPreKeyBundle) {
      let decryptedMessage = await sessionCipher.decryptPreKeyWhisperMessage(
        cipherText.body,
        "binary"
      );
      return util.toString(decryptedMessage);
    } else {
      let decryptedMessage = await sessionCipher.decryptWhisperMessage(
        cipherText.body,
        "binary"
      );
      return util.toString(decryptedMessage);
    }
  }

  async _generateIdentityAsync() {
    var results = await Promise.all([
      libsignal.KeyHelper.generateIdentityKeyPair(),
      libsignal.KeyHelper.generateRegistrationId(),
    ]);

    this.store.put("identityKey", results[0]);
    this.store.put("registrationId", results[1]);
  }

  async _generatePreKeyBundleAsync() {
    var result = await Promise.all([
      this.store.getIdentityKeyPair(),
      this.store.getLocalRegistrationId(),
    ]);

    let identity = result[0];
    let registrationId = result[1];

    var keys = await Promise.all([
      libsignal.KeyHelper.generatePreKey(registrationId + 1),
      libsignal.KeyHelper.generatePreKey(registrationId + 2),
      libsignal.KeyHelper.generatePreKey(registrationId + 3),
      libsignal.KeyHelper.generatePreKey(registrationId + 4),
      libsignal.KeyHelper.generateSignedPreKey(identity, registrationId + 1),
    ]);

    let preKeys = [keys[0], keys[1], keys[2], keys[3]];
    let signedPreKey = keys[4];

    preKeys.forEach((preKey) => {
      this.store.storePreKey(preKey.keyId, preKey.keyPair);
    });
    this.store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);

    let publicPreKeys = preKeys.map((preKey) => {
      return {
        keyId: preKey.keyId,
        publicKey: preKey.keyPair.pubKey,
      };
    });
    return {
      identityKey: identity.pubKey,
      registrationId: registrationId,
      preKeys: publicPreKeys,
      signedPreKey: {
        keyId: signedPreKey.keyId,
        publicKey: signedPreKey.keyPair.pubKey,
        signature: signedPreKey.signature,
      },
    };
  }
}

export async function createSignalProtocolManager(
  userid,
  name,
  dummySignalServer
) {
  let signalProtocolManagerUser = new SignalProtocolManager(
    userid,
    dummySignalServer
  );
  await Promise.all([signalProtocolManagerUser.initializeAsync()]);
  return signalProtocolManagerUser;
}
