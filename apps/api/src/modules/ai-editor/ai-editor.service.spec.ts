import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AiEditorService } from './ai-editor.service';

const messagesCreateMock = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: messagesCreateMock },
  }));
});

describe('AiEditorService', () => {
  const linksServiceMock = {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  };
  const profilesServiceMock = {
    getByUserId: jest.fn(),
    update: jest.fn(),
  };

  function makeConfig(apiKey?: string) {
    return { get: () => apiKey } as any;
  }

  const existingLinks = [
    {
      id: 'link-1',
      type: 'SOCIAL',
      title: 'Instagram',
      url: 'https://instagram.com/x',
      icon: null,
      metadata: null,
      isActive: true,
      order: 10,
    },
    {
      id: 'link-2',
      type: 'WHATSAPP',
      title: 'WhatsApp',
      url: null,
      icon: null,
      metadata: { phone: '123' },
      isActive: true,
      order: 20,
    },
  ];
  const profile = {
    displayName: 'Mi Perfil',
    bio: 'Bio',
    seoTitle: null,
    seoDescription: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    linksServiceMock.list.mockResolvedValue(existingLinks);
    profilesServiceMock.getByUserId.mockResolvedValue(profile);
  });

  describe('plan', () => {
    it('throws ServiceUnavailableException when no API key is configured', async () => {
      const service = new AiEditorService(
        linksServiceMock as any,
        profilesServiceMock as any,
        makeConfig(undefined),
      );

      await expect(
        service.plan('user-1', 'agregá un bloque de texto'),
      ).rejects.toThrow(ServiceUnavailableException);
      expect(messagesCreateMock).not.toHaveBeenCalled();
    });

    it('sends the current page state and forces the propose_changes tool', async () => {
      const service = new AiEditorService(
        linksServiceMock as any,
        profilesServiceMock as any,
        makeConfig('sk-ant-test'),
      );
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'propose_changes',
            input: {
              summary: 'Voy a agregar un bloque',
              operations: [
                { op: 'create_block', type: 'TEXT', title: 'Nuevo' },
              ],
            },
          },
        ],
      });

      const plan = await service.plan('user-1', 'agregá un bloque de texto');

      expect(messagesCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tool_choice: { type: 'tool', name: 'propose_changes' },
        }),
      );
      const callArgs = messagesCreateMock.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('link-1');
      expect(plan.summary).toBe('Voy a agregar un bloque');
      expect(plan.operations).toEqual([
        {
          op: 'create_block',
          type: 'TEXT',
          title: 'Nuevo',
          url: undefined,
          icon: undefined,
          metadata: undefined,
          order: undefined,
        },
      ]);
    });

    it('throws when the model responds without a tool_use block', async () => {
      const service = new AiEditorService(
        linksServiceMock as any,
        profilesServiceMock as any,
        makeConfig('sk-ant-test'),
      );
      messagesCreateMock.mockResolvedValue({
        content: [{ type: 'text', text: 'oops' }],
      });

      await expect(service.plan('user-1', 'algo')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejects a proposal that references a block id which does not exist', async () => {
      const service = new AiEditorService(
        linksServiceMock as any,
        profilesServiceMock as any,
        makeConfig('sk-ant-test'),
      );
      messagesCreateMock.mockResolvedValue({
        content: [
          {
            type: 'tool_use',
            name: 'propose_changes',
            input: {
              summary: 'x',
              operations: [{ op: 'delete_block', linkId: 'not-a-real-id' }],
            },
          },
        ],
      });

      await expect(service.plan('user-1', 'borrá ese bloque')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('apply', () => {
    function makeService() {
      return new AiEditorService(
        linksServiceMock as any,
        profilesServiceMock as any,
        makeConfig(undefined),
      );
    }

    it('creates a block via LinksService for a create_block operation', async () => {
      const service = makeService();
      await service.apply('user-1', [
        { op: 'create_block', type: 'TEXT', title: 'Nuevo bloque' },
      ]);

      expect(linksServiceMock.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ type: 'TEXT', title: 'Nuevo bloque' }),
      );
    });

    it('updates a block via LinksService for an update_block operation targeting an owned block', async () => {
      const service = makeService();
      await service.apply('user-1', [
        {
          op: 'update_block',
          linkId: 'link-1',
          patch: { title: 'Nuevo título' },
        },
      ]);

      expect(linksServiceMock.update).toHaveBeenCalledWith(
        'user-1',
        'link-1',
        expect.objectContaining({ title: 'Nuevo título' }),
      );
    });

    it('rejects update_block against a block id the caller does not own', async () => {
      const service = makeService();

      await expect(
        service.apply('user-1', [
          {
            op: 'update_block',
            linkId: 'someone-elses-link',
            patch: { title: 'x' },
          },
        ]),
      ).rejects.toThrow(BadRequestException);
      expect(linksServiceMock.update).not.toHaveBeenCalled();
    });

    it('deletes a block via LinksService for a delete_block operation', async () => {
      const service = makeService();
      await service.apply('user-1', [{ op: 'delete_block', linkId: 'link-2' }]);

      expect(linksServiceMock.remove).toHaveBeenCalledWith('user-1', 'link-2');
    });

    it('reorders via LinksService, converting the id list into sequential order values', async () => {
      const service = makeService();
      await service.apply('user-1', [
        { op: 'reorder_blocks', orderedIds: ['link-2', 'link-1'] },
      ]);

      expect(linksServiceMock.reorder).toHaveBeenCalledWith('user-1', {
        items: [
          { id: 'link-2', order: 10 },
          { id: 'link-1', order: 20 },
        ],
      });
    });

    it('rejects reorder_blocks with an id outside the caller own blocks', async () => {
      const service = makeService();

      await expect(
        service.apply('user-1', [
          { op: 'reorder_blocks', orderedIds: ['link-1', 'not-mine'] },
        ]),
      ).rejects.toThrow(BadRequestException);
      expect(linksServiceMock.reorder).not.toHaveBeenCalled();
    });

    it('updates the profile via ProfilesService, restricted to content fields only', async () => {
      const service = makeService();
      await service.apply('user-1', [
        {
          op: 'update_profile',
          profilePatch: { bio: 'Nueva bio', seoTitle: 'Nuevo título' },
        },
      ]);

      expect(profilesServiceMock.update).toHaveBeenCalledWith('user-1', {
        bio: 'Nueva bio',
        seoTitle: 'Nuevo título',
      });
    });

    it('silently drops security-sensitive fields from update_profile even if the model proposes them', async () => {
      const service = makeService();
      await service.apply('user-1', [
        {
          op: 'update_profile',
          profilePatch: {
            bio: 'Nueva bio',
            isPublished: false,
            username: 'hacked',
            pagePassword: 'evil123',
          },
        },
      ]);

      expect(profilesServiceMock.update).toHaveBeenCalledWith('user-1', {
        bio: 'Nueva bio',
      });
    });

    it('ignores an unrecognized top-level field on a create_block operation (only known fields are ever forwarded)', async () => {
      // create_block's fields are read from the flat, multi-purpose tool
      // schema shared by all 5 op kinds, so an explicit pick (not a
      // whitelist check) is what keeps unrelated fields out — see
      // parseAndValidateOperations. Confirms it doesn't crash and simply
      // ignores the stray key.
      const service = makeService();
      await service.apply('user-1', [
        { op: 'create_block', type: 'TEXT', title: 'x', notARealField: 'y' },
      ]);

      expect(linksServiceMock.create).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ title: 'x' }),
      );
    });

    it("rejects an update_block patch with a field that isn't part of UpdateLinkDto", async () => {
      // Unlike create_block, `patch` is the AI's own dedicated nested
      // object (not shared with other op kinds) and is passed through to
      // validateAgainst() whole — a typo/hallucinated field here really
      // does mean class-validator's forbidNonWhitelisted should reject it.
      const service = makeService();

      await expect(
        service.apply('user-1', [
          {
            op: 'update_block',
            linkId: 'link-1',
            patch: { title: 'x', notARealField: 'y' },
          },
        ]),
      ).rejects.toThrow(BadRequestException);
      expect(linksServiceMock.update).not.toHaveBeenCalled();
    });

    it('rejects a create_block payload with an invalid LinkType', async () => {
      const service = makeService();

      await expect(
        service.apply('user-1', [
          { op: 'create_block', type: 'NOT_A_REAL_TYPE', title: 'x' },
        ]),
      ).rejects.toThrow(BadRequestException);
      expect(linksServiceMock.create).not.toHaveBeenCalled();
    });

    it('rejects an operation with an unknown op kind', async () => {
      const service = makeService();

      await expect(
        service.apply('user-1', [{ op: 'delete_everything' }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('applies multiple operations in order and returns the resulting page state', async () => {
      const service = makeService();
      linksServiceMock.list
        .mockResolvedValueOnce(existingLinks)
        .mockResolvedValueOnce([...existingLinks]);

      const result = await service.apply('user-1', [
        { op: 'create_block', type: 'TEXT', title: 'Nuevo' },
        { op: 'delete_block', linkId: 'link-2' },
      ]);

      expect(linksServiceMock.create).toHaveBeenCalledTimes(1);
      expect(linksServiceMock.remove).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('links');
      expect(result).toHaveProperty('profile');
    });
  });
});
