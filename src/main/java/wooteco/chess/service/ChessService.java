package wooteco.chess.service;

import java.util.Arrays;

import org.springframework.stereotype.Service;

import wooteco.chess.domain.Result;
import wooteco.chess.domain.Status;
import wooteco.chess.domain.Team;
import wooteco.chess.domain.chessboard.Board;
import wooteco.chess.domain.chesspiece.Blank;
import wooteco.chess.domain.chesspiece.Piece;
import wooteco.chess.domain.factory.BoardFactory;
import wooteco.chess.domain.position.Position;
import wooteco.chess.entity.BoardEntity;
import wooteco.chess.repository.BoardRepository;
import wooteco.chess.repository.PieceRepository;
import wooteco.chess.repository.TurnRepository;

@Service
public class ChessService {
	private final BoardRepository boardRepository;
	private final TurnRepository turnRepository;
	private final PieceRepository pieceRepository;

	public ChessService(BoardRepository boardRepository, TurnRepository turnRepository,
		PieceRepository pieceRepository) {
		this.boardRepository = boardRepository;
		this.turnRepository = turnRepository;
		this.pieceRepository = pieceRepository;
	}

	public Board move(Position start, Position target, Long boardId) {
		Board board = init(boardId);
		Piece startPiece = board.findByPosition(start);

		board.move(start, target);
		pieceRepository.update(startPiece.getName(), target.getString(), boardId);
		pieceRepository.update(Blank.NAME, start.getString(), boardId);
		turnRepository.update(board.isWhiteTurn(), boardId);

		return board;
	}

	public Board init(Long id) {
		// TODO id를 roomID로 mapping
		BoardEntity boardEntity = boardRepository.findById(id)
			.orElseGet(() -> boardRepository.save(BoardEntity.from(BoardFactory.create())));
		return boardEntity.createBoard();

	}

	public Board restart(Long id) {
		boardRepository.deleteAll();
		turnRepository.deleteAll();
		return init(id);
	}

	public boolean isNotEnd(Long id) {
		Board board = init(id);
		return board.isLiveBothKing();
	}

	public Team findWinningTeam(Long id) {
		Board board = init(id);
		return Arrays.stream(Team.values())
			.filter(board::isLiveKing)
			.findFirst()
			.orElseThrow(() -> new IllegalArgumentException("승리팀이 없습니다."));
	}

	public Result status(Long id) {
		Board board = init(id);
		Status status = board.createStatus();
		return status.getResult();
	}
}
