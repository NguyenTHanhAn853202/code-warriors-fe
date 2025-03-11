import { TbNotes } from 'react-icons/tb';
import { GrPowerCycle } from 'react-icons/gr';
import { useState } from 'react';
import TagLevel from './TagLevel';
import DOMPurify from 'dompurify';

const tags = {
    description: 'description',
    submissions: 'submissions',
};

const html = ` <div class="container">
<h2>Substring Count Problem</h2>
<p>You are given a string <code>word</code> and a non-negative integer <code>k</code>.</p>
<p>Return the total number of substrings of <code>word</code> that contain every vowel ('a', 'e', 'i', 'o', and 'u') at least once and exactly <code>k</code> consonants.</p>

<h3>Examples</h3>

<div class="example">
    <strong>Example 1:</strong>
    <p><strong>Input:</strong> <code>word = "aeioqq", k = 1</code></p>
    <p><strong>Output:</strong> <code>0</code></p>
    <p><strong>Explanation:</strong> There is no substring with every vowel.</p>
</div>

<div class="example">
    <strong>Example 2:</strong>
    <p><strong>Input:</strong> <code>word = "aeiou", k = 0</code></p>
    <p><strong>Output:</strong> <code>1</code></p>
    <p><strong>Explanation:</strong> The only substring with every vowel and zero consonants is <code>word[0..4]</code>, which is <code>"aeiou"</code>.</p>
</div>

<div class="example">
    <strong>Example 3:</strong>
    <p><strong>Input:</strong> <code>word = "ieaouqqieaouqq", k = 1</code></p>
    <p><strong>Output:</strong> <code>3</code></p>
    <p><strong>Explanation:</strong> The substrings with every vowel and one consonant are:</p>
    <ul>
        <li><code>word[0..5]</code>, which is <code>"ieaouq"</code>.</li>
        <li><code>word[6..11]</code>, which is <code>"qieaou"</code>.</li>
        <li><code>word[7..12]</code>, which is <code>"ieaouq"</code>.</li>
    </ul>
</div>

<h3>Constraints</h3>
<ul>
    <li><code>5 <= word.length <= 2 * 10^5</code></li>
    <li><code>word</code> consists only of lowercase English letters.</li>
    <li><code>0 <= k <= word.length - 5</code></li>
</ul>
</div>`;

const sanitizedHtml = DOMPurify.sanitize(html);

function DetailProblem() {
    const [tag, setTag] = useState(tags.description);
    return (
        <div>
            <div className="flex bg-gray-50 items-center h-[30px] space-x-3 px-3 py-2">
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.description}
                    className={'flex items-center cursor-pointer ' + `${tag !== tags.description ? 'opacity-60' : ''}`}
                >
                    <TbNotes className="text-xl text-sky-300" />
                    <span className="block ml-1 text-sm ">Description</span>
                </button>
                <div className="h-[20px] w-[2px] rounded-lg bg-gray-300 "></div>
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.submissions}
                    className={'flex items-center cursor-pointer ' + `${tag !== tags.submissions ? 'opacity-60' : ''}`}
                >
                    <GrPowerCycle className="text-xl text-amber-300" />
                    <span className="block ml-2 text-sm">Submissions</span>
                </button>
            </div>
            <div className="px-4 py-5 space-y-3">
                <h1 className="font-mono text-2xl">
                    3306. Count of Substrings Containing Every Vowel and K Consonants II
                </h1>
                <div>
                    <span className='text-base font-light'>Level: </span>
                    <TagLevel />
                </div>
                <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></div>
            </div>
        </div>
    );
}

export default DetailProblem;
