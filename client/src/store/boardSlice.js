import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from '@reduxjs/toolkit';
import axiosInstance from '../axiosConfig';

// 게시물 목록 가져오기
export const fetchBoards = createAsyncThunk('boards/fetchBoards', async () => {
  const response = await axiosInstance.get('http://localhost:8080/boards');
  return response.data;
}); // 여기서 게시글을 가져와서

// 게시물 수정
export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, board }) => {
    const response = await axiosInstance.patch(
      `http://localhost:8080/boards/${boardId}`,
      board
    );
    return response.data;
  }
);

// 게시물 삭제
export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId) => {
    await axiosInstance.delete(`http://localhost:8080/boards/${boardId}`);
    return boardId;
  }
);

// 댓글 추가
export const addComment = createAsyncThunk(
  'boards/addComment',
  async ({ boardId, comment }) => {
    const response = await axiosInstance.post(
      `http://localhost:8080/boards/${boardId}/comment`,
      comment
    );
    return { boardId, comment: response.data };
  }
);

// 댓글 수정
export const updateComment = createAsyncThunk(
  'boards/updateComment',
  async ({ boardId, commentId, content }) => {
    const response = await axiosInstance.put(
      `http://localhost:8080/boards/${boardId}/comment/${commentId}`,
      { content }
    );
    return response.data;
  }
);

// 댓글 삭제
export const deleteComment = createAsyncThunk(
  'boards/deleteComment',
  async ({ boardId, commentId }) => {
    await axiosInstance.delete(
      `http://localhost:8080/boards/${boardId}/comment/${commentId}`
    );
    return { boardId, commentId };
  }
);

// 게시물 필터링 기능
const boardSlice = createSlice({
  name: 'board',
  initialState: {
    boards: [],
    searchTerm: '',
    loading: false,
    error: null,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    }, //  state의 검색어 상태 변화 = action값;
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      }) // 로딩중이면 로딩값은 true, error는 false
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.boards = action.payload;
      }) // 로딩이 완료되면 loading은 false, error는 false, boards의 상태는 action 값이다.
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      }) // 연결에 실패하면 loading은 false가 되고 error를 발생시킨다.
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { boardId, comment } = action.payload;
        const updatedBoards = state.boards.map((board) => {
          if (board.id === boardId) {
            return {
              ...board,
              comment: [...board.comment, comment],
            };
          }
          return board;
        });

        state.boards = updatedBoards;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { boardId, commentId, content } = action.payload;
        const updatedBoards = state.boards.map((board) => {
          if (board.id === boardId) {
            const updatedComments = board.comment.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  content,
                };
              }
              return comment;
            });

            return {
              ...board,
              comment: updatedComments,
            };
          }
          return board;
        });

        state.boards = updatedBoards;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const { boardId, commentId } = action.payload;
        const updatedBoards = state.boards.map((board) => {
          if (board.id === boardId) {
            const updatedComments = board.comment.filter(
              (comment) => comment.id !== commentId
            );

            return {
              ...board,
              comment: updatedComments,
            };
          }
          return board;
        });

        state.boards = updatedBoards;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const boardId = action.payload;
        state.boards = state.boards.filter((board) => board.id !== boardId);
      });
  },
});

export const { setSearchTerm } = boardSlice.actions;

export const selectFilteredBoards = createSelector(
  (state) => state.board.boards,
  (state) => state.board.searchTerm,
  (boards, searchTerm) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return boards.filter((board) => {
      const { food, content, who, tag, comment } = board;
      const comments = comment.map((c) => c.content.toLowerCase());
      return (
        food.toLowerCase().includes(lowerCaseSearchTerm) ||
        content.toLowerCase().includes(lowerCaseSearchTerm) ||
        who.toLowerCase().includes(lowerCaseSearchTerm) ||
        tag.toLowerCase().includes(lowerCaseSearchTerm) ||
        comments.some((c) => c.includes(lowerCaseSearchTerm))
      );
    });
  }
);

export default boardSlice.reducer;
