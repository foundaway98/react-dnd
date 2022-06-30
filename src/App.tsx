import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { toDoState } from "./atoms";
import Board, { Title } from "./Components/Board";
/* dnd?
dnd 구성요소 : DragDropContext, Droppable, Draggable
  DragDropContext : DnD 요소를 넣을 공간.
  Droppable : 어떤것을 드롭할 수 있는 영역.
  Draggable : 우리가 드래그 할 수 있는 영역.

  DragDropContext의 필수요소
    1. onDragEnd : user가 drag를 끝냈을 때 불려지는 함수.
    2. children : DragDropContext tag 내부의 요소.

  Droppable의 필수요소
    1. droppableId
    2. children : react 요소이면 안됨. children은 함수여야 함.

    Draggable의 필수요소
    1. draggableId
    2. index
    */

const Wrapper = styled.div`
  display: flex;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;

const BMWrapper = styled.div`
  display: flex;
  max-width: 680px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  height: 5vh;
`;

const Boards = styled.div`
  display: grid;
  width: 100%;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
`;

const TrashArea = styled.div`
  max-width: 680px;
  width: 60%;
  padding-top: 10px;
  background-color: ${(props) => props.theme.boardColor};
  border-radius: 5px;
  min-height: 100px;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
`;

const Trash = styled.div<IAreaProps>`
  background-color: darkgray;
  padding: 20px;
`;

const BoardMaker = styled.form`
  width: 100%;
  justify-content: center;
  align-items: center;
  input {
    width: 100%;
  }
`;

interface IAreaProps {
  isDraggingFromThis: boolean;
  isDraggingOver: boolean;
}
interface IForm {
  boardId: string;
}

function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const onDragEnd = (info: DropResult) => {
    console.log(info);
    const { destination, source } = info;
    if (!destination) return;
    if (destination?.droppableId === source.droppableId) {
      //same board movement.
      setToDos((allBoard) => {
        const boardCopy = [...allBoard[source.droppableId]]; // source의 droppableId로부터 array를 복사하는 과정.
        const taskObj = boardCopy[source.index]; // to do object를 가져옴. draggableId는 string만 가져오기 때문에 우리는 이 string을 이용해서 object를 가져와야함.
        // 1) Delete item on source.index
        boardCopy.splice(source.index, 1);
        // 2) Put back the item on the destination.index
        boardCopy.splice(destination?.index, 0, taskObj);
        return {
          ...allBoard,
          [source.droppableId]: boardCopy,
        };
      });
    } else if (destination.droppableId === "remove") {
      setToDos((allBoard) => {
        const boardCopy = [...allBoard[source.droppableId]]; // source의 droppableId로부터 array를 복사하는 과정.
        // 1) Delete item on source.index
        boardCopy.splice(source.index, 1);
        return {
          ...allBoard,
          [source.droppableId]: boardCopy,
        };
      });
    } else if (destination.droppableId !== source.droppableId) {
      //cross board movement
      setToDos((allBoard) => {
        const sourceBoard = [...allBoard[source.droppableId]]; // 시작지점
        const taskObj = sourceBoard[source.index]; //source.index가 우리 board의 어떤 위치에 taskObj가 있는지 알려줌.
        const destinationBoard = [...allBoard[destination.droppableId]]; // 도착지점
        sourceBoard.splice(source.index, 1);
        destinationBoard.splice(destination?.index, 0, taskObj);
        return {
          ...allBoard,
          [source.droppableId]: sourceBoard,
          [destination.droppableId]: destinationBoard,
        };
      });
    }
  };
  // add Boards
  const { register, setValue, handleSubmit } = useForm<IForm>();
  const onValid = ({ boardId }: IForm) => {
    setToDos((allBoards) => {
      return { ...allBoards, [boardId]: [] };
    });
    setValue("boardId", "");
  };
  //Draggable의 key값과 draggableId 값이 같아야해서 key를 toDo로 줌.
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Title>TO DO LIST</Title>
      <BMWrapper>
        <BoardMaker onSubmit={handleSubmit(onValid)}>
          <input
            {...register("boardId", { required: true })}
            type="text"
            placeholder="Write Board Title"
          ></input>
        </BoardMaker>
      </BMWrapper>
      <Wrapper>
        <Boards>
          {Object.keys(toDos).map((boardId) => (
            <Board boardId={boardId} key={boardId} toDos={toDos[boardId]} />
          ))}
        </Boards>
      </Wrapper>
      <TrashArea>
        <Title>Remove Here</Title>
        <Droppable droppableId="remove">
          {(provided, snapshot) => (
            <Trash
              isDraggingOver={snapshot.isDraggingOver}
              isDraggingFromThis={Boolean(snapshot.draggingFromThisWith)}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {provided.placeholder}
            </Trash>
          )}
        </Droppable>
      </TrashArea>
    </DragDropContext>
  );
}

export default App;
