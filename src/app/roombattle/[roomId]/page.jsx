import RoomBattleClient from './RoomBattleClient';

export default async function Page({ params }) {
    const { roomId } = await params;
    return <RoomBattleClient roomId={roomId} />;
}
