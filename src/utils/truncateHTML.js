export default function truncateHTML(html, maxLength) {
    const div = document.createElement('div');
    div.innerHTML = html;
    let result = '';
    let length = 0;

    function traverse(node) {
        if (length >= maxLength) return;

        if (node.nodeType === Node.TEXT_NODE) {
            const remaining = maxLength - length;
            const text = node.textContent.slice(0, remaining);
            result += text;
            length += text.length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            result += `<${node.nodeName.toLowerCase()}${[...node.attributes]
        .map(attr => ` ${attr.name}="${attr.value}"`)
        .join('')}>`;

      for (const child of node.childNodes) {
        traverse(child);
        if (length >= maxLength) break;
      }

      result += `</${node.nodeName.toLowerCase()}>`;
    }
  }

  for (const child of div.childNodes) {
    traverse(child);
    if (length >= maxLength) break;
  }

  return result + (length >= maxLength ? '...' : '');
}