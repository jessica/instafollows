import React, { useState } from 'react';

export default function NotFollowingBackChecker() {
  const [notFollowingBack, setNotFollowingBack] = useState([]);

  const handleFiles = async (e) => {
    const files = e.target.files;
    const followersFile = Array.from(files).find(file => file.name.includes('followers'));
    const followingFile = Array.from(files).find(file => file.name.includes('following'));

    if (!followersFile || !followingFile) {
      alert('Please upload both followers_1.json and following.json');
      return;
    }

    const [followersText, followingText] = await Promise.all([
      followersFile.text(),
      followingFile.text(),
    ]);

    const followersData = JSON.parse(followersText);
    const followingData = JSON.parse(followingText);

    const followersSet = new Set(
      followersData.map(entry => entry.string_list_data?.[0]?.value).filter(Boolean)
    );

    const followingList = followingData.relationships_following.map(
      entry => entry.string_list_data?.[0]?.value
    ).filter(Boolean);

    const notFollowing = followingList.filter(user => !followersSet.has(user));
    setNotFollowingBack(notFollowing);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Instagram Non-Followers Checker</h1>
      <input type="file" multiple accept=".json" onChange={handleFiles} />
      {notFollowingBack.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">People you're following who don't follow back:</h2>
          <ul className="list-disc list-inside mt-2">
  {notFollowingBack.map((user, index) => (
    <li key={index}>
      <a
        href={`https://www.instagram.com/${user}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        @{user}
      </a>
    </li>
  ))}
</ul>
        </div>
      )}
    </div>
  );
}
