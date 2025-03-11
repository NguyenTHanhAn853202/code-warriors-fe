import { Tag } from 'antd';

function TagLevel({ point }) {
    // handle tag
    const title = 'medium';
    const status = 'gold';
    return <Tag className='rounded-lg' color={status}>{title}</Tag>;
}

export default TagLevel;
