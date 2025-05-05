import React, { useState, useRef } from 'react';
import styles from './NotFollowingBackChecker.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk, faUpload } from '@fortawesome/free-solid-svg-icons';

export default function NotFollowingBackChecker() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [notFollowingBack, setNotFollowingBack] = useState([]);
  const [unfollowers, setUnfollowers] = useState([]);
  const [snapshotNames, setSnapshotNames] = useState(Object.keys(getSnapshots()));
  const fileInputRef = useRef();

  function getSnapshots() {
    return JSON.parse(localStorage.getItem("snapshots") || "{}");
  }

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFiles = async (files) => {
    const followersFile = files.find(file => file.name.includes('followers'));
    const followingFile = files.find(file => file.name.includes('following'));

    if (!followersFile || !followingFile) {
      alert("Please upload both followers_1.json and following.json");
      return;
    }

    const [followersText, followingText] = await Promise.all([
      followersFile.text(),
      followingFile.text()
    ]);

    const followersJson = JSON.parse(followersText);
    const followingJson = JSON.parse(followingText);

    const followersList = followersJson.map(entry => entry.string_list_data?.[0]?.value).filter(Boolean);
    const followingList = followingJson.relationships_following.map(entry => entry.string_list_data?.[0]?.value).filter(Boolean);

    setFollowers(followersList);
    setFollowing(followingList);

    const followersSet = new Set(followersList);
    const notBack = followingList.filter(user => !followersSet.has(user));
    setNotFollowingBack(notBack);
  };

  const saveSnapshot = () => {
    const name = prompt("Name this snapshot:");
    if (!name) return;

    const snapshots = getSnapshots();
    snapshots[name] = { followers, following };
    localStorage.setItem("snapshots", JSON.stringify(snapshots));
    setSnapshotNames(Object.keys(snapshots));
    alert(`Snapshot "${name}" saved.`);
  };

  const compareToSnapshot = (name) => {
    const snapshot = getSnapshots()[name];
    if (!snapshot) {
      alert("Snapshot not found");
      return;
    }

    const currentFollowersSet = new Set(followers);
    const previousFollowersList = snapshot.followers || [];

    const unfollowed = previousFollowersList.filter(user => !currentFollowersSet.has(user));
    setUnfollowers(unfollowed);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>📊 Instagram Follower Tracker</h1>

      <div
        className={styles.dropZone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current.click()}
      >
        <FontAwesomeIcon icon={faUpload} style={{ fontSize: '40px', fontWeight: 300, color: '#333' }} />
        <p>Drag & drop your <code>followers_1.json</code> and <code>following.json</code> here,<br />or click to choose files:</p>
        <input
          type="file"
          multiple
          accept=".json"
          ref={fileInputRef}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
          className={styles.hiddenFileInput}
        />
      </div>

      {followers.length > 0 && following.length > 0 && (
        <div className={styles.controls}>
          <button onClick={saveSnapshot} className={styles.button}>
            <FontAwesomeIcon icon={faFloppyDisk} style={{ marginRight: '5px' }} />
            Save Snapshot
          </button>

          <label className={styles.dropdownLabel}>
            Compare to:
            <select
              onChange={(e) => compareToSnapshot(e.target.value)}
              defaultValue=""
              className={styles.dropdown}
            >
              <option value="" disabled>Select a snapshot</option>
              {snapshotNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(notFollowingBack.length > 0 || unfollowers.length > 0) && (
        <div className={styles.listsRow}>
          {notFollowingBack.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.subHeader}>❌ Not Following You Back</h2>
              <ul className={styles.list}>
                {notFollowingBack.map(user => (
                  <li key={user}>
                    <a
                      href={`https://instagram.com/${user}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkBlue}
                    >
                      @{user}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unfollowers.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.subHeader}>📉 Recently Unfollowed (Comparison)</h2>
              <ul className={styles.list}>
                {unfollowers.map(user => (
                  <li key={user}>
                    <a
                      href={`https://instagram.com/${user}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkRed}
                    >
                      @{user}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
